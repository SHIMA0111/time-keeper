use std::collections::{HashMap, VecDeque};
use actix_web::{Either, HttpRequest, Responder};
use log::{error, info};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};
use crate::utils::sql::get::get_category_setting;
use crate::utils::types::category_setting::{CategoryInformation, CategoryName, CategoryResponse};

pub async fn category_setting(req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();
    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => {
            error!("Access DB failed.");
            return response;
        }
    };

    let result = get_category_setting(&conn).await;

    if let Err(e) = result {
        error!("Getting category setting failed Because of [{}]", e.to_string());
        let response = HttpResponseBody::failed_new(
            "Failed to get category setting",
            &endpoint_uri,
        );
        return InternalServerError.json_response_builder(response);
    }

    let rows = result.unwrap();

    let mut info_vec = Vec::new();

    for row in &rows {
        let table_name: String = row.get("table_name");
        let display_name: String = row.get("display_name");
        let superior_table: Option<String> = row.get("superior_table");
        let info = CategoryInformation::new(table_name, display_name, superior_table);
        info_vec.push(info);
    }

    let graph = build_graph(&info_vec);
    let ordered_table_names = topological_sort(&graph);
    info_vec.sort_by(|a, b| {
        let get_index = |data: &CategoryInformation| {
            ordered_table_names.iter().position(|x| *x == data.get_table_name())
        };

        let index_a = get_index(a);
        let index_b = get_index(b);
        if index_a.is_none() || index_b.is_none() {
            error!("category sorting failed due to the category doesn't match the ordering table.");
        };
        index_a.unwrap().cmp(&index_b.unwrap())
    });

    let name_vec = info_vec.iter().map(|val| {
        val.get_category_name()
    }).collect::<Vec<CategoryName>>();

    let category_data = match CategoryResponse::new(&name_vec) {
        Ok(category_data) => category_data,
        Err(e) => {
            error!("Failed to generate category_data due to [{}]", e.to_string());
            let response = HttpResponseBody::failed_new(
                "Failed to generate category setting response",
                &endpoint_uri
            );
            return InternalServerError.json_response_builder(response);
        }
    };

    let response = HttpResponseBody::success_new(category_data, &endpoint_uri);

    return RequestOk.json_response_builder(response);
}

fn build_graph(categories: &[CategoryInformation]) -> HashMap<String, Vec<String>> {
    let mut graph = HashMap::new();
    for category in categories {
        let table_name = category.get_table_name();
        graph.entry(table_name.to_string()).or_insert_with(Vec::new);
        if let Some(superior) = &category.superior_table() {
            graph.entry(superior.to_string())
                .or_insert_with(Vec::new)
                .push(table_name);
        }
    }
    graph
}

fn topological_sort(graph: &HashMap<String, Vec<String>>) -> Vec<String> {
    let mut indegree = HashMap::new();
    for (node, edges) in graph {
        indegree.entry(node).or_insert(0);
        for edge in edges {
            *indegree.entry(edge).or_insert(0) += 1;
        }
    }

    let mut queue: VecDeque<String> = indegree.iter()
        .filter(|(_, &deg)| deg == 0)
        .map(|(&node, _)| node.to_string())
        .collect();

    let mut order = Vec::new();

    while let Some(node) = queue.pop_front() {
        order.push(node.to_string());
        if let Some(edges) = graph.get(&node) {
            for edge in edges {
                let count = indegree.entry(edge)
                    .and_modify(|e| *e -= 1).or_insert(0);
                if count.clone() == 0 {
                    queue.push_back(edge.to_string());
                }
            }
        }
    }

    order
}



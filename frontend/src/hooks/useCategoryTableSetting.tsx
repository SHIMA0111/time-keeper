import {useEffect, useState} from "react";
import {Response} from "../types/api/response.ts";
import {CategorySetting, Names} from "../types/api/categorySetting.ts";
import {useToastMessage} from "./useToastMessage.tsx";
import {useAuthedEndpoint} from "./useAuthedEndpoint.tsx";

export const useCategoryTableSetting = () => {
    const [categoryInfo, setCategoryInfo] = useState<CategorySetting>({} as CategorySetting);
    const [categoryNames, setCategoryNames] = useState<Names[]>([]);
    const authedEndpoint = useAuthedEndpoint("http://localhost:8888");
    const {toastMessage} = useToastMessage();
    
    useEffect(() => {
        authedEndpoint.get<Response>("/category_setting")
            .then(res => {
                if (res.data) {
                    const response = res.data;
                    if (response.request_success) {
                        const categoryNames: CategorySetting = JSON.parse(response.data);
                        setCategoryInfo(categoryNames);
                    }
                    else {
                        console.error(`Response doesn't have data: ${res}`);
                        toastMessage({
                            title: "Response doesn't have any data",
                            description: "please reload page later. if you cannot resolve this situation ever, please contact developer",
                            status: "error"
                        });
                    }
                }
            })
            .catch(err => {
                console.error(`API return error ${err}`);
                const statusCode = err.response?.status;
                if (statusCode === 401) {
                    toastMessage({
                        title: "Unauthorized",
                        description: "You are not authorized to access this resource.",
                        status: "error"
                    });
                }
                else {
                    let message;
                    if (err.response?.data) {
                        message = err.response.data.reason;
                    }
                    else {
                        message = "Failed to get categories";
                    }
                    toastMessage({
                        title: "Unexpected Error occurred",
                        description: message,
                        status: "error"
                    });
                }
            })
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [toastMessage]);
    
    useEffect(() => {
        const values = (Object.values(categoryInfo)).filter((val): val is Names => {
            return !(val === null || typeof val === "number");
        });
        setCategoryNames(values);
    }, [categoryInfo]);
    
    return {categoryInfo, categoryNames}
}
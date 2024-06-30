export type NewOrUpdateCategory = {
    id: string;
    table_name: string;
    new_category_name: string;
    superior_id: string | undefined;
};
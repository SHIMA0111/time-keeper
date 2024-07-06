import {useSetRecoilState} from "recoil";
import {categoriesData, CategoryData} from "../recoil/category/categoryData.ts";
import {Response} from "../types/api/response.ts";
import {useAuthedEndpoint} from "./useAuthedEndpoint.ts";
import {useToastMessage} from "./useToastMessage.ts";
import {useCallback} from "react";
import {HandleApiRequest} from "../utils/handleApiRequest.ts";

export const useCategory = () => {
    const setCategoryData = useSetRecoilState(categoriesData);
    const axiosAuthedEndpoint = useAuthedEndpoint();
    const { toastMessage } = useToastMessage();
    
    const categoryGetTrigger = useCallback(async () => {
        await HandleApiRequest<CategoryData[]>(
            axiosAuthedEndpoint.get<Response>("/categories"),
            "get category information",
            (category) => {
                category.sort((a, b) => a.table_name.localeCompare(b.table_name));
                setCategoryData(category);
            },
            false,
            toastMessage,
        );
    }, [axiosAuthedEndpoint, setCategoryData, toastMessage]);
    
    return {categoryGetTrigger};
}
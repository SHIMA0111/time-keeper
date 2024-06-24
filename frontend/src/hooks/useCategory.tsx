import {useSetRecoilState} from "recoil";
import {categoriesData, CategoryData} from "../recoil/category/categoryData.ts";
import {Response} from "../types/api/response.ts";
import {useAuthedEndpoint} from "./useAuthedEndpoint.tsx";
import {useToastMessage} from "./useToastMessage.tsx";
import {useCallback} from "react";

export const useCategory = () => {
    const setCategoryData = useSetRecoilState(categoriesData);
    const axiosAuthedEndpoint = useAuthedEndpoint();
    const { toastMessage } = useToastMessage();
    
    const categoryGetTrigger = useCallback(() => {
        axiosAuthedEndpoint.get<Response>("/categories")
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    if (!resData.request_success) {
                        toastMessage({
                            title: "Failed to get category information",
                            description: "Get category information process returns failed",
                            status: "error"
                        });
                    }
                    const categoriesData: CategoryData[] = JSON.parse(resData.data);
                    setCategoryData(categoriesData);
                }
                else {
                    toastMessage({
                        title: "Response has no data",
                        description: "Response violates the expected format. " +
                            "If you face this error continuously, please contact the developer.",
                        status: "error",
                    });
                }
            })
            .catch(err => {
                const errorReason = err.response?.data?.failed_reason;
                toastMessage({
                    title: "Failed to get category information",
                    description: errorReason || "Unexpected error occurred",
                    status: "error",
                })
            });
    }, [axiosAuthedEndpoint, setCategoryData, toastMessage]);
    
    return {categoryGetTrigger};
}
import {useEffect, useState} from "react";
import {SelectedCategoryType} from "../recoil/category/selectedCategoryState.ts";
import {Response} from "../types/api/response.ts";
import {CategoryName} from "../types/api/categoryName.ts";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {allCategoryState} from "../recoil/category/allCategoryState.ts";
import {useToastMessage} from "./useToastMessage.tsx";
import {useAuthedEndpoint} from "./useAuthedEndpoint.tsx";
import {ItemsProps} from "../components/uiParts/inputs/CategoryOptionGeneration.tsx";
import {tempSelectedCategoryState} from "../recoil/category/tempSelectedCategoryState.ts";

export const useCategoryItems = (props: ItemsProps) => {
    const {categoryTableName, superiorKeyName, keyName} = props;
    const setAllCategory = useSetRecoilState(allCategoryState);
    const tempSelectedCategory = useRecoilValue(tempSelectedCategoryState);
    const [categoryOptions, setCategoryOptions] = useState<CategoryName[]>([]);
    
    const {toastMessage} = useToastMessage();
    const axiosAuthed = useAuthedEndpoint("http://localhost:8888");
    
    useEffect(() => {
        const categoryPair = tempSelectedCategory[superiorKeyName as keyof SelectedCategoryType];
        const superior_id = categoryPair?.id;
        if (superiorKeyName && !superior_id) {
            setCategoryOptions([]);
            setAllCategory(prevVal => ({
                ...prevVal,
                [keyName]: []
            }));
            return;
        }
        if (superior_id && isNaN(Number(superior_id))) return;
        const superiorId = superior_id ? Number(superior_id) : undefined;
        if (!axiosAuthed) return;
        axiosAuthed.get<Response>("/category_name", {
            params: {
                table_name: categoryTableName,
                superior_id: superiorId }
        })
            .then(res => {
                if (res.data) {
                    const data = res.data;
                    const categoryData: CategoryName[] = JSON.parse(data.data);
                    setAllCategory(prevVal => ({
                        ...prevVal,
                        [keyName]: categoryData,
                    }));
                    setCategoryOptions(categoryData);
                }
                else {
                    toastMessage({
                        title: `Failed to get ${categoryTableName} categories`,
                        description: "Please try later. If you cannot resolve this ever, please contact developer",
                        status: "error"
                    })
                }
            })
            .catch(err => {
                const response = err.response;
                console.error(`Failed to get data by ${response ? response.data.failed_reason : "unexpected"}`);
                toastMessage({
                    title: "Failed to get category options.",
                    description: "Please reopen the modal later. If you cannot access later, please contact later",
                    status: "error"
                });
            })
    }, [categoryTableName, keyName, tempSelectedCategory, setAllCategory, superiorKeyName, toastMessage, axiosAuthed]);
    
    return {categoryOptions}
}
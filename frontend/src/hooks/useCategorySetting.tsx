import {useRecoilState} from "recoil";
import {categoriesData, CategoryContent, CategoryData} from "../recoil/category/categoryData.ts";
import {useCallback, useEffect, useState} from "react";
import {NewOrUpdateCategory} from "../types/api/category.ts";
import {useAuthedEndpoint} from "./useAuthedEndpoint.tsx";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "./useToastMessage.tsx";

export const useCategorySetting = () => {
    const [originalCategories, setOriginalCategories] = useRecoilState(categoriesData);
    const [categories, setCategories] = useState<CategoryData[]>([...originalCategories]);
    const [dummyIdNum, setDummyIdNum] = useState(0);
    const authedEndpoint = useAuthedEndpoint();
    const {toastMessage} = useToastMessage();
    
    useEffect(() => {
        setCategories([...originalCategories]);
    }, [originalCategories]);
    
    const setNewCategories = useCallback((tableName: string, newCategory: CategoryContent) => {
        const newCategories: CategoryData[] = categories.map((category) => {
            if (!(category.table_name === tableName)) {
                return category;
            }
            if (!newCategory.id) {
                const dummy_id = dummyIdNum;
                setDummyIdNum(prev => prev + 1);
                return {
                    ...category,
                    categories: [...category.categories,
                        {...newCategory, id: `dummy_${dummy_id}`}]
                };
            }
            const newCategoryContents: CategoryContent[] = category.categories.map(categoryContent => {
                if (categoryContent.id === newCategory.id) {
                    return {
                        ...categoryContent,
                        name: newCategory.name,
                        superior_id: newCategory.superior_id,
                    };
                }
                else {
                    return categoryContent;
                }
            });
            return {
                ...category,
                categories: newCategoryContents,
            };
        });
        newCategories.sort((a, b) => {
            if (a.table_name < b.table_name) {
                return -1;
            }
            if (a.table_name > b.table_name) {
                return 1;
            }
            return 0;
        });
        setCategories(newCategories);
    }, [categories, dummyIdNum]);
    
    const cancelEditing = useCallback(() => {
        setCategories([...originalCategories]);
    }, [originalCategories]);
    
    const saveEditing = useCallback(() => {
        const inputCategories: NewOrUpdateCategory[] = [];
        categories.map(category => {
            const tableName = category.table_name;
            const res: NewOrUpdateCategory[] = category.categories.map(content => {
                const id = content.id || "";
                const superior_id = content.superior_id === "" ? undefined : content.superior_id;
                return {
                    id,
                    table_name: tableName,
                    new_category_name: content.name,
                    superior_id,
                };
            });
            inputCategories.push(...res);
        });
        
        authedEndpoint.post<Response>("/create_category", inputCategories)
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    const categorySetting: CategoryData[] = JSON.parse(resData.data);
                    categorySetting.sort((a, b) => {
                        if (a.table_name < b.table_name) {
                            return -1;
                        }
                        if (a.table_name > b.table_name) {
                            return 1;
                        }
                        return 0;
                    });
                    setCategories([...categorySetting]);
                    setOriginalCategories([...categorySetting]);
                    toastMessage({
                        title: "Success Category update",
                        status: "success",
                    });
                }
                else {
                    toastMessage({
                        title: "Response invalid",
                        description: "Failed to access server. Please try later.",
                        status: "error"
                    })
                }
            })
            .catch(err => {
                const statusCode = err.response?.status;
                let errorReason = err.response?.data?.failed_reason;
                if (statusCode === 403) {
                    errorReason = "Authentication failed by token invalid";
                }
                toastMessage({
                    title: "Request failed",
                    description: errorReason || "Unexpected error occurred",
                    status: "error",
                })
            });
    }, [authedEndpoint, categories, setOriginalCategories, toastMessage]);
    
    const removeCategory = useCallback((tableName: string, categoryId: string | undefined) => {
        if (!categoryId) return;
        if (categoryId.startsWith("dummy_")) {
            const newCategory = categories.map(category => {
                if (category.table_name !== tableName) return category;
                const newCategoryContents = category.categories.filter(categoryItem => {
                    return categoryItem.id !== categoryId
                });
                
                return {
                    ...category,
                    categories: newCategoryContents,
                };
            });
            setCategories(newCategory);
        }
        else {
            const category: CategoryContent = {
                id: categoryId,
                name: "",
                superior_id: "",
            }
            setNewCategories(tableName, category);
        }
    }, [categories, setNewCategories]);
    
    return {categories, setNewCategories, cancelEditing, saveEditing, removeCategory};
}
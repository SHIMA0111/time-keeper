import {useRecoilState} from "recoil";
import {categoriesData, CategoryContent, CategoryData} from "../recoil/category/categoryData.ts";
import {useCallback, useEffect, useState} from "react";

export const useCategorySetting = () => {
    const [originalCategories, setOriginalCategories] = useRecoilState(categoriesData);
    const [categories, setCategories] = useState<CategoryData[]>([...originalCategories]);
    
    useEffect(() => {
        setCategories([...originalCategories]);
    }, [originalCategories]);
    
    const setNewCategories = useCallback((tableName: string, newCategory: CategoryContent) => {
        const newCategories: CategoryData[] = categories.map((category) => {
            if (!(category.table_name === tableName)) {
                return category;
            }
            if (!newCategory.id) {
                return {
                    ...category,
                    categories: [...category.categories, newCategory]
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
        
        setCategories(newCategories);
    }, [categories]);
    
    const cancelEditing = useCallback(() => {
        setCategories([...originalCategories]);
    }, [originalCategories]);
    
    const saveEditing = useCallback(() => {
        setOriginalCategories([...categories]);
    }, [categories, setOriginalCategories]);
    
    return {categories, setNewCategories, cancelEditing, saveEditing};
}
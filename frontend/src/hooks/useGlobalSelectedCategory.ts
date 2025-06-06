import {ChangeEvent, useCallback, useState} from "react";
import {selectedCategoryData, SelectedCategoryType} from "../recoil/category/selectedCategoryData.ts";
import {categoriesData, CategoryContent} from "../recoil/category/categoryData.ts";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {AliasInput} from "../types/api/alias.ts";
import {generateRandomString} from "../utils/generateRandomString.ts";

const superiorTableStructure = new Map([
    ["sub4_category", "sub3_category"],
    ["sub3_category", "sub2_category"],
    ["sub2_category", "sub1_category"],
    ["sub1_category", "main_category"],
]);

const tableNames = ["main_category", "sub1_category", "sub2_category", "sub3_category", "sub4_category"];

export const useGlobalSelectedCategory = () => {
    const categories = useRecoilValue(categoriesData);
    const setSelectedCategory = useSetRecoilState(selectedCategoryData);
    const [tmpSelectedCategory, setTmpSelectedCategory]
        = useState<SelectedCategoryType>({
        aliasId: undefined,
        main_category: undefined,
        sub1_category: undefined,
        sub2_category: undefined,
        sub3_category: undefined,
        sub4_category: undefined,
    });
    const [isSaveAlias, setIsSaveAlias] = useState(false);
    const [aliasName, setAliasName] = useState("");

    const superiorIdGetter = useCallback((tableName: string) => {
        const superiorTable = superiorTableStructure.get(tableName);
        if (!superiorTable) return;
        const superiorCategory = tmpSelectedCategory[superiorTable as keyof SelectedCategoryType];
        if (!superiorCategory || typeof superiorCategory === "string") return;

        return superiorCategory.id;
    }, [tmpSelectedCategory])

    const resetTmpSelectedCategory = useCallback(
        (changedTableName: string, changedCategory: CategoryContent | undefined) => {
            const indexOfChangedTable =
                tableNames.includes(changedTableName) ? tableNames.indexOf(changedTableName) + 1 : 4;
            let newSelectedCategory = {} as SelectedCategoryType;
            let superiorId = changedCategory ? changedCategory.id : undefined;
            
            for (let i = 0; i < tableNames.length; i += 1) {
                const childCategoryTable = tableNames[i] as keyof SelectedCategoryType;
                const childCategory = tmpSelectedCategory[childCategoryTable];
                if (typeof childCategory === "string") continue;
                if (i <= indexOfChangedTable) {
                    newSelectedCategory = {
                        ...newSelectedCategory,
                        [childCategoryTable]: childCategory,
                    }
                }
                else {
                    newSelectedCategory = {
                        ...newSelectedCategory,
                        [childCategoryTable]:
                        childCategory?.superior_id === superiorId || !(childCategory?.superior_id) ? childCategory : undefined,
                    };
                }
                superiorId = childCategory?.id;
            }
            setTmpSelectedCategory(newSelectedCategory);
    }, [tmpSelectedCategory]);

    const addSelectedCategory = useCallback((tableName: string, category: CategoryContent | undefined) => {
        resetTmpSelectedCategory(tableName, category);
        setTmpSelectedCategory(oldVal => {
            return {
                ...oldVal,
                [tableName]: category,
            }
        });
        let childTable = tableName;
        let childCategory = category;
        while (superiorTableStructure.has(childTable)) {
            if (!(childCategory?.superior_id)) break;
            const superiorTable = superiorTableStructure.get(childTable);
            if (!superiorTable) break;

            const categoryTable = categories.filter(category => {
                return category.table_name === superiorTable;
            })[0];
            const superiorCategory = categoryTable.categories.filter(content => {
                if (!childCategory) return false;
                return content.id === childCategory.superior_id;
            })[0];
            setTmpSelectedCategory(oldVal => {
                return {
                    ...oldVal,
                    [superiorTable]: superiorCategory,
                }
            });
            childTable = superiorTable;
            childCategory = superiorCategory;
        }
    }, [categories, resetTmpSelectedCategory]);
    
    const onChangeAliasName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setAliasName(e.target.value);
    }, [setAliasName]);
    
    const onToggleIsSave = useCallback(() => {
        setIsSaveAlias(!isSaveAlias);
    }, [isSaveAlias, setIsSaveAlias])
    
    
    const onSave = useCallback(() => {
        if (tmpSelectedCategory.main_category?.id) {
            const aliasData: AliasInput = {
                alias_name: aliasName || "alias_" + generateRandomString(20),
                main_id: tmpSelectedCategory.main_category.id,
                sub1_id: tmpSelectedCategory.sub1_category?.id,
                sub2_id: tmpSelectedCategory.sub2_category?.id,
                sub3_id: tmpSelectedCategory.sub3_category?.id,
                sub4_id: tmpSelectedCategory.sub4_category?.id,
                is_auto_registered: !isSaveAlias,
            };
            console.log(aliasData);
        }
        setSelectedCategory(tmpSelectedCategory);
    }, [aliasName, isSaveAlias, setSelectedCategory, tmpSelectedCategory]);

    return {
        tmpSelectedCategory,
        addSelectedCategory,
        superiorIdGetter,
        resetTmpSelectedCategory,
        onSave,
        isSaveAlias,
        onToggleIsSave,
        aliasName,
        onChangeAliasName,
    };
}
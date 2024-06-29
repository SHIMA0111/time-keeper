import {ChangeEvent, FC, memo, useCallback, useEffect, useState} from "react";
import {EditableForm} from "../../../../inputs/EditableForm.tsx";
import {Flex} from "@chakra-ui/react";
import {CategoryContent} from "../../../../../../recoil/category/categoryData.ts";
import {NoShadowSelect} from "../../../../inputs/NoShadowSelect.tsx";

type Props = {
    tableName: string;
    categoryItem: CategoryContent;
    parentCategoryItems: CategoryContent[];
    setAddOrUpdateCategory: (tableName: string, newCategory: CategoryContent) => void;
}

export const CategorySettingRow: FC<Props> = memo((props) => {
    const {tableName, categoryItem, parentCategoryItems, setAddOrUpdateCategory} = props;
    
    const [categoryName, setCategoryName] = useState(categoryItem.name);
    const [superiorId, setSuperiorId] = useState(categoryItem.superior_id);
    const onChangeSelectSuperiorId = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setSuperiorId(e.target.value);
    }, []);
    useEffect(() => {
        setCategoryName(categoryItem.name);
        setSuperiorId(categoryItem.superior_id);
    }, [categoryItem.name, categoryItem.superior_id]);
    
    useEffect(() => {
        const updatedCategorySetting: CategoryContent = {
            ...categoryItem,
            name: categoryName,
            superior_id: superiorId
        };
        setAddOrUpdateCategory(tableName, updatedCategorySetting);
    }, [categoryName, superiorId, tableName]);
    
    return (
        <Flex key={categoryItem.id} flex={1}>
            <EditableForm
                label={categoryItem.name}
                isDisplayLabel={false}
                value={categoryName}
                setFunction={setCategoryName} />
            <NoShadowSelect
                placeholder="親カテゴリの選択"
                value={superiorId || ""}
                onChange={onChangeSelectSuperiorId}
                isDisabled={tableName === "main_category"}>
                {
                    parentCategoryItems.map(parentCategory => (
                        <option value={parentCategory.id}>{parentCategory.name}</option>
                    ))
                }
            </NoShadowSelect>
        </Flex>
    );
})
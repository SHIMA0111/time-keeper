import {ChangeEvent, FC, memo, useCallback, useEffect, useState} from "react";
import {EditableForm} from "../../../../inputs/EditableForm.tsx";
import {Flex, HStack, IconButton} from "@chakra-ui/react";
import {CategoryContent} from "../../../../../../recoil/category/categoryData.ts";
import {NoShadowSelect} from "../../../../inputs/NoShadowSelect.tsx";
import {CloseIcon} from "@chakra-ui/icons";

type Props = {
    tableName: string;
    categoryItem: CategoryContent;
    parentCategoryItems: CategoryContent[];
    setUpdateCategory: (tableName: string, newCategory: CategoryContent) => void;
    removeCategory: (tableName: string, CategoryId: string | undefined) => void;
}

export const CategorySettingRow: FC<Props> = memo((props) => {
    const {tableName,
        categoryItem,
        parentCategoryItems, setUpdateCategory, removeCategory} = props;
    
    const [categoryName, setCategoryName] = useState(categoryItem.name);
    const [superiorId, setSuperiorId] = useState(categoryItem.superior_id);
    const [validParentCategoryItems, setValidParentCategoryItems] = useState(parentCategoryItems);
    const onChangeSelectSuperiorId = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setSuperiorId(e.target.value);
    }, []);
    
    const onClickRemoveButton = useCallback(() => {
        removeCategory(tableName, categoryItem.id);
    }, [categoryItem.id, removeCategory, tableName]);
    
    useEffect(() => {
        setCategoryName(categoryItem.name);
        setSuperiorId(categoryItem.superior_id);
    }, [categoryItem.name, categoryItem.superior_id]);
    useEffect(() => {
        const tmpValidParentContentItems = parentCategoryItems.filter(parent => {
            return parent.name !== ""
        });
        setValidParentCategoryItems(tmpValidParentContentItems);
    }, [parentCategoryItems]);
    
    useEffect(() => {
        const updatedCategorySetting: CategoryContent = {
            ...categoryItem,
            name: categoryName,
            superior_id: superiorId
        };
        setUpdateCategory(tableName, updatedCategorySetting);
    }, [categoryName, superiorId, tableName]);
    
    return (
        <Flex key={categoryItem.id} flex={1}>
            <HStack w="100%">
                <EditableForm
                    label={categoryItem.name}
                    isDisplayLabel={false}
                    value={categoryName}
                    setFunction={setCategoryName} />
                <NoShadowSelect
                    placeholder="親カテゴリなし"
                    value={superiorId || ""}
                    onChange={onChangeSelectSuperiorId}
                    isDisabled={tableName === "main_category"}>
                    {
                        validParentCategoryItems.map(parentCategory => {
                            
                            return (
                                <option key={parentCategory.id} value={parentCategory.id}>
                                    {parentCategory.name}
                                </option>
                            )
                        })
                    }
                </NoShadowSelect>
                <IconButton
                    aria-label={`remove_${categoryItem.id}`}
                    bgColor="transparent"
                    size="xs"
                    onClick={onClickRemoveButton}
                    icon={<CloseIcon />} />
            </HStack>
        </Flex>
    );
})
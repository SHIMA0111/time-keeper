import {FC, memo, useCallback, useEffect, useState} from "react";
import {
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Stack
} from "@chakra-ui/react";
import {CategoryContent, CategoryData} from "../../../../../recoil/category/categoryData.ts";
import {CategorySettingRow} from "./CategorySettingAccordionItem/CategorySettingRow.tsx";
import {AddButton} from "../../../buttons/AddButton.tsx";

type Props = {
    category: CategoryData;
    parentCategoryItems: CategoryContent[];
    setNewCategory: (tableName: string, newCategory: CategoryContent) => void;
    removeCategory: (tableName: string, categoryId: string | undefined) => void;
}

export const CategorySettingAccordionItem: FC<Props> = memo((props) => {
    const {category, parentCategoryItems, setNewCategory, removeCategory} = props;
    const [validCategories, setValidCategories] = useState(category.categories);
    
    const onClickAddCategory = useCallback(() => {
        const categoryNum = category.categories.length;
        const defaultCategory: CategoryContent = {
            id: undefined,
            name: `category${categoryNum}`,
            superior_id: '',
        }
        setNewCategory(category.table_name, defaultCategory);
    }, [category.categories.length, category.table_name, setNewCategory]);
    
    useEffect(() => {
        const tmpValidCategory = category.categories.filter(categoryItem => {
            return categoryItem.name !== ""
        });
        setValidCategories(tmpValidCategory);
    }, [category.categories]);
    
    return (
        <AccordionItem>
            <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                    {category.display_name}
                </Box>
                <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
                <Box overflow="auto">
                    <Stack minW="450px">
                        {
                            validCategories.map(categoryItem => {
                                return (
                                    <CategorySettingRow
                                        key={categoryItem.id}
                                        tableName={category.table_name}
                                        categoryItem={categoryItem}
                                        parentCategoryItems={parentCategoryItems}
                                        setUpdateCategory={setNewCategory}
                                        removeCategory={removeCategory}
                                    />
                                );
                            })
                        }
                    </Stack>
                </Box>
                <AddButton onClick={onClickAddCategory} />
            </AccordionPanel>
        </AccordionItem>
    );
});
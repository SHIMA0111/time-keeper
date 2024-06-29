import {FC, memo} from "react";
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

type Props = {
    category: CategoryData;
    parentCategoryItems: CategoryContent[];
    setNewCategory: (tableName: string, newCategory: CategoryContent) => void;
}

export const CategorySettingAccordionItem: FC<Props> = memo((props) => {
    const {category, parentCategoryItems, setNewCategory} = props;
    
    return (
        <AccordionItem key={category.table_name}>
            <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                    {category.display_name}
                </Box>
                <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
                <Stack>
                    {
                        category.categories.map(categoryItem => {
                            return (
                                <CategorySettingRow
                                    key={categoryItem.id}
                                    tableName={category.table_name}
                                    categoryItem={categoryItem}
                                    parentCategoryItems={parentCategoryItems}
                                    setAddOrUpdateCategory={setNewCategory}
                                />
                            );
                        })
                    }
                    <Box
                        as="button"
                        w="100%"
                        border="1px dashed #ccc"
                        color="#333"
                        textAlign="center"
                        borderRadius="4px"
                        _hover={{
                            border: "1px solid #ccc",
                            cursor: "pointer",
                        }}>
                        +
                    </Box>
                </Stack>
            </AccordionPanel>
        </AccordionItem>
    );
});
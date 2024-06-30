import {FC, memo} from "react";
import {
    Accordion,
    Center,
    HStack,
    TabPanel,
    VStack
} from "@chakra-ui/react";
import {MainButton} from "../../buttons/MainButton.tsx";
import {SubButton} from "../../buttons/SubButton.tsx";
import {CategorySettingAccordionItem} from "./CategorySettingTab/CategorySettingAccordionItem.tsx";
import {useCategorySetting} from "../../../../hooks/useCategorySetting.tsx";

export const CategorySettingTab: FC = memo(() => {
    const {categories, setNewCategories, saveEditing, cancelEditing, removeCategory} = useCategorySetting();
    
    return (
        <TabPanel>
            <VStack>
                <Accordion w="100%" allowMultiple>
                    {
                        categories.map((category, id) => {
                            const parentCategory = id - 1 >= 0 ? categories[id - 1].categories : [];
                            return (
                                <CategorySettingAccordionItem
                                    key={category.table_name}
                                    category={category}
                                    parentCategoryItems={parentCategory}
                                    setNewCategory={setNewCategories}
                                    removeCategory={removeCategory} />
                            );
                        })
                    }
                </Accordion>
                <Center>
                    <HStack spacing={4}>
                        <MainButton onClick={saveEditing}>Save</MainButton>
                        <SubButton onClick={cancelEditing}>Cancel</SubButton>
                    </HStack>
                </Center>
            </VStack>
        </TabPanel>
    );
})
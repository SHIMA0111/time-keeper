import {FC, memo} from "react";
import {Box, HStack, Text, Tooltip} from "@chakra-ui/react";
import {RotateInformation} from "./RotateInformation.tsx";
import {useRecoilValue} from "recoil";
import {categoriesData} from "../../../../recoil/category/categoryData.ts";
import {selectedCategoryData, SelectedCategoryType} from "../../../../recoil/category/selectedCategoryData.ts";

export const CurrentSettingDisplay: FC = memo(() => {
    const categories = useRecoilValue(categoriesData);
    const selectedCategories = useRecoilValue(selectedCategoryData);
    
    return (
        <>
            <Box ml="16px" w={`calc(100% - (24px * (${categories.length} - 1) + 16px))`} display={{ base: "none", md: "block" }}>
                <HStack spacing="24px">
                    {
                        categories.map(category => {
                            const categoryContent = selectedCategories[category.table_name as keyof SelectedCategoryType];
                            const categoryName = typeof categoryContent === 'undefined' || typeof categoryContent === 'string' ? "" : categoryContent.name;
                            const label = `${category.display_name}: ${categoryName}`;
                            return (
                                <Tooltip key={category.table_name} label={label} openDelay={500}>
                                    <Text
                                        fontSize="sm"
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        cursor="default"
                                    >
                                        {label}
                                    </Text>
                                </Tooltip>
                            );
                        })
                    }
                </HStack>
            </Box>
            <Box ml="16px" cursor="default" display={{ base: "none", sm: "block", md: "none" }}>
                <RotateInformation />
            </Box>
        </>
    )
});
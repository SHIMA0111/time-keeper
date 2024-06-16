import {FC, memo} from "react";
import {Box, HStack, Text, Tooltip} from "@chakra-ui/react";
import {RotateInformation} from "./RotateInformation.tsx";
import {useRecoilValue} from "recoil";
import {categoriesData} from "../../../../recoil/category/categoryData.ts";

export const CurrentSettingDisplay: FC = memo(() => {
    const categories = useRecoilValue(categoriesData);
    
    return (
        <>
            <Box ml="16px" w={`calc(100% - (24px * (${categories.length} - 1) + 16px))`} display={{ base: "none", md: "block" }}>
                <HStack spacing="24px">
                    {
                        categories.map(category => (
                            <Tooltip key={category.table_name} label={category.display_name}>
                                <Text
                                    fontSize="sm"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    cursor="default"
                                >
                                    {category.display_name}
                                </Text>
                            </Tooltip>
                        ))
                    }
                </HStack>
            </Box>
            <Box ml="16px" cursor="default" display={{ base: "none", sm: "block", md: "none" }}>
                <RotateInformation />
            </Box>
        </>
    )
});
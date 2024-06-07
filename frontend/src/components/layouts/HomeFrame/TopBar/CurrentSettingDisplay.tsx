import {FC, memo} from "react";
import {Box, Fade, HStack, Text, Tooltip} from "@chakra-ui/react";
import {RotateInformation} from "./RotateInformation.tsx";
import {Names} from "../../../../types/api/categorySetting.ts";
import {useRecoilValue} from "recoil";
import {selectedCategoryState, SelectedCategoryType} from "../../../../recoil/category/selectedCategoryState.ts";
import {useCurrentSetting} from "../../../../hooks/useCurrentSetting.tsx";

type Props = {
    information: Names[],
    contents_num: number,
}

export const CurrentSettingDisplay: FC<Props> = memo((props) => {
    const { information, contents_num } = props;
    const selectedCategory = useRecoilValue(selectedCategoryState);
    const {informationValues, isHaveInformation, categoryKey} = useCurrentSetting(information);

    return (
        <>
            <Box ml="16px" w={`calc(100% - (24px * (${contents_num} - 1) + 16px))`} display={{ base: "none", md: "block" }}>
                <Fade in={isHaveInformation}>
                    <HStack spacing="24px">
                        {
                            informationValues.map((info, i) => {
                                const selectedCategoryInfo = selectedCategory[categoryKey[i] as keyof SelectedCategoryType];
                                let categoryName;
                                if (selectedCategoryInfo) {
                                    categoryName = selectedCategoryInfo.name;
                                }
                                else {
                                    categoryName = "";
                                }
                                
                                const infoWithCategory = `${info.display_name}: ${categoryName}`
                                return (
                                <Tooltip key={info.display_name} label={infoWithCategory} openDelay={500}>
                                    <Text
                                        fontSize="sm"
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        cursor="default"
                                    >
                                        {infoWithCategory}
                                    </Text>
                                </Tooltip>
                            )})
                        }
                    </HStack>
                </Fade>
            </Box>
            <Box ml="16px" cursor="default" display={{ base: "none", sm: "block", md: "none" }}>
                <RotateInformation information={[]} />
            </Box>
        </>
    )
});
import {FC, memo} from "react";
import {Box, HStack, Text, Tooltip} from "@chakra-ui/react";
import {RotateInformation} from "./RotateInformation.tsx";

type Props = {
    information: string[]
}

export const CurrentSettingDisplay: FC<Props> = memo((props) => {
    const { information } = props;

    return (
        <>
            <Box ml="16px" w={`calc(100% - (24px * (${information.length} - 1) + 16px))`} display={{ base: "none", md: "block" }}>
                <HStack spacing="24px">
                    {
                        information.map(info => (
                            <Tooltip key={info} label={info}>
                                <Text
                                    fontSize="sm"
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    cursor="default"
                                >
                                    {info}:
                                </Text>
                            </Tooltip>
                        ))
                    }
                </HStack>
            </Box>
            <Box ml="16px" cursor="default" display={{ base: "none", sm: "block", md: "none" }}>
                <RotateInformation information={information} />
            </Box>
        </>
    )
});
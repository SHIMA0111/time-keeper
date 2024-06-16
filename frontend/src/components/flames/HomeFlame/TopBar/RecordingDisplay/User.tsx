import {FC, memo} from "react";
import {Box, Text} from "@chakra-ui/react";
import {useRecoilValue} from "recoil";
import {userState} from "../../../../../recoil/user/userState.ts";


export const User: FC = memo(() => {
    const username = useRecoilValue(userState);
    
    return (
        <Box fontSize="sm" cursor="default">
            こんにちは、
            <Text
                display="inline"
                color="blue"
                fontWeight="bold"
                cursor="pointer"
            >
                {username}
            </Text>
            さん
        </Box>
    )
})
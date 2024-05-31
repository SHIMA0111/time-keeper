import {FC, memo} from "react";
import {Flex} from "@chakra-ui/react";
import {LoginCard} from "../uiParts/cards/LoginCard.tsx";

export const Login: FC = memo(() => {
    return (
        <Flex align="flex-start" justify="center" marginTop="30vh">
            <LoginCard />
        </Flex>
    );
})
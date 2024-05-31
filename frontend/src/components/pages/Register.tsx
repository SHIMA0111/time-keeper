import {FC, memo} from "react";
import {RegisterCard} from "../uiParts/cards/RegisterCard.tsx";
import {Flex} from "@chakra-ui/react";

export const Register: FC = memo(() => {
    return (
        <Flex align="flex-start" justify="center" marginTop="30vh">
            <RegisterCard />
        </Flex>
    )
});
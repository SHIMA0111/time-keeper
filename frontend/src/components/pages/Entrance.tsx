import {FC, memo, useCallback, useState} from "react";
import {Flex} from "@chakra-ui/react";
import {LoginCard} from "../uiParts/cards/LoginCard.tsx";
import {RegisterCard} from "../uiParts/cards/RegisterCard.tsx";

export const Entrance: FC = memo(() => {
    const [isLoginCard, setIsLoginCard] = useState(true);
    
    const toRegister = useCallback(() => setIsLoginCard(false), []);
    const toLogin = useCallback(() => setIsLoginCard(true), []);
    
    return (
        <Flex align="flex-start" justify="center" marginTop="30vh">
            {
                isLoginCard ? <LoginCard toRegister={toRegister} /> : <RegisterCard toLogin={toLogin} />
            }
        </Flex>
    );
})
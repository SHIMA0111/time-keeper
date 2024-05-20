import {Flex} from "@chakra-ui/react";
import {FC, memo, ReactNode} from "react";
import {NavigationBar} from "./NavigationBar/NavigationBar.tsx";
import {Logo} from "../../uiParts/images/Logo.tsx";
import {TopBar} from "./TopBar/TopBar.tsx";

type Props = {
    children: ReactNode;
}

export const HomeFlame: FC<Props> = memo((props) => {
    const { children } = props;
    
    return (
        <Flex w="100%" h="100vh">
            <Flex
                w={{md: "25%", lg: "20%", xl: "15%"}}
                h="100%"
                flexDirection="column"
                display={{ base: "none", md: "flex" }}
            >
                <Logo src="https://source.unsplash.com/bmmcfZqSjBU" />
                <NavigationBar />
            </Flex>
            <Flex w={{base: "100%", md: "75%", lg: "80%", xl: "85%"}} flexDirection="column" h="100%">
                <TopBar />
                {children}
            </Flex>
        </Flex>
    );
});
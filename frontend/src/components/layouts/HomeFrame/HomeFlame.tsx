import {Flex} from "@chakra-ui/react";
import {FC, memo, ReactNode} from "react";
import {NavigationBar} from "./NavigationBar/NavigationBar.tsx";
import {Logo} from "../../uiParts/images/Logo.tsx";
import {TopBar} from "./TopBar/TopBar.tsx";
import {Names} from "../../../types/api/categorySetting.ts";

type Props = {
    children: ReactNode;
    contentNum: number;
    categoryNames: Names[];
}

export const HomeFlame: FC<Props> = memo((props) => {
    const { children, contentNum, categoryNames } = props;
    
    return (
        <Flex w="100%" h="100vh">
            <Flex
                w={{md: "25%", lg: "20%", xl: "15%"}}
                h="100%"
                flexDirection="column"
                display={{ base: "none", md: "flex" }}
            >
                <Logo src="/timekeeper_logo.webp" />
                <NavigationBar />
            </Flex>
            <Flex w={{base: "100%", md: "75%", lg: "80%", xl: "85%"}} flexDirection="column" h="100%">
                <TopBar contentNums={contentNum} categoryNames={categoryNames} />
                {children}
            </Flex>
        </Flex>
    );
});
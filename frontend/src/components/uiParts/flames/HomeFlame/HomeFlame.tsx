import {
    Box,
    Drawer,
    DrawerCloseButton,
    DrawerContent,
    DrawerOverlay,
    Flex,
    useBreakpointValue,
    useDisclosure
} from "@chakra-ui/react";
import {FC, memo, ReactNode} from "react";
import {NavigationBar} from "./NavigationBar/NavigationBar.tsx";
import {Logo} from "../../images/Logo.tsx";
import {TopBar} from "./TopBar/TopBar.tsx";
import {FloatingMenuButton} from "../../buttons/FloatingMenuButton.tsx";

type Props = {
    children: ReactNode;
}

export const HomeFlame: FC<Props> = memo((props) => {
    const { children } = props;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const breakpoint = useBreakpointValue({ base: "base", md: "md" });
    
    return (
        <>
            <Flex w="100%" h="100vh">
                <Flex
                    w={{md: "25%", lg: "20%", xl: "15%"}}
                    h="100%"
                    flexDirection="column"
                    display={{ base: "none", md: "flex" }}
                >
                    <Logo src="https://source.unsplash.com/bmmcfZqSjBU" />
                    <NavigationBar h="92%" />
                </Flex>
                <Flex w={{base: "100%", md: "75%", lg: "80%", xl: "85%"}} flexDirection="column" h="100%">
                    <TopBar />
                    <Box h={{base: "85%", md: "92%"}} bgColor="gray.200" overflowY="auto">
                        {children}
                    </Box>
                </Flex>
            </Flex>
            <Drawer isOpen={isOpen} onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <NavigationBar h="100%" />
                </DrawerContent>
            </Drawer>
            <FloatingMenuButton
                visible={true}
                onClick={onOpen}
                hidden={!(breakpoint == "base")}
                bottom="24px"
                right="24px"
                size="32px" />
        </>
    );
});
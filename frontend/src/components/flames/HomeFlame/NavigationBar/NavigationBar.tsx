import {FC, memo} from "react";
import {
    Flex,
    Modal, ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Stack,
    useDisclosure
} from "@chakra-ui/react";
import {IconButtonWithName} from "../../../uiParts/buttons/IconButtonWithName.tsx";
import {BiLogOut} from "react-icons/bi";
import {useLogout} from "../../../../hooks/useLogout.tsx";
import {MainButton} from "../../../uiParts/buttons/MainButton.tsx";
import {HomeRoutes} from "../../../../routers/HomeRoutes.tsx";

export const NavigationBar: FC = memo(() => {
    const { onLogout } = useLogout();
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            <Flex as="aside" h="92%" flexDirection="column" justify="space-between">
                <Flex flexDirection="column" overflow="scroll">
                    {HomeRoutes.map(route => (
                        <IconButtonWithName
                            key={route.pageName}
                            icon={route.icon}
                            to={`/home${route.path}`}
                            w="100%">
                            {route.pageName}
                        </IconButtonWithName>
                    ))}
                </Flex>
                <IconButtonWithName onClick={onOpen} icon={<BiLogOut />}>ログアウト</IconButtonWithName>
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <Stack>
                        <ModalHeader>ログアウト</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>ログアウトボタンが押されました。本当にログアウトしますか？</ModalBody>
                        <MainButton onClick={onLogout}>はい</MainButton>
                    </Stack>
                </ModalContent>
            </Modal>
        </>
    )
});
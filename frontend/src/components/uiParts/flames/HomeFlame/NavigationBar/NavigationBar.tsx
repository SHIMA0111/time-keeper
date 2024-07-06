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
import {IconButtonWithName} from "../../../buttons/IconButtonWithName.tsx";
import {BiLogOut} from "react-icons/bi";
import {useLogout} from "../../../../../hooks/useLogout.ts";
import {HomeRoutes} from "../../../../../routers/HomeRoutes.tsx";
import {SubButton} from "../../../buttons/SubButton.tsx";

type Props = {
    h: string;
}

export const NavigationBar: FC<Props> = memo((props) => {
    const {h} = props;
    
    const { onLogout } = useLogout();
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            <Flex as="aside" h={h} flexDirection="column" justify="space-between">
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
                        <SubButton onClick={onLogout}>はい</SubButton>
                    </Stack>
                </ModalContent>
            </Modal>
        </>
    )
});
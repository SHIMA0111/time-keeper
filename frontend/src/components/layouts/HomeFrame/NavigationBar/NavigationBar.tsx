import {FC, memo, useCallback} from "react";
import {
    Flex,
    Modal,
    ModalBody, ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay, Stack,
    useDisclosure
} from "@chakra-ui/react";
import {HomeNavigations} from "./HomeNavigations.tsx";
import {IconButtonWithName} from "../../../uiParts/buttons/IconButtonWithName.tsx";
import {BiLogOut} from "react-icons/bi";
import {useSetRecoilState} from "recoil";
import {authenticateState} from "../../../../recoil/authentication/authenticateState.ts";
import {useToastMessage} from "../../../../hooks/useToastMessage.tsx";
import {useNavigate} from "react-router-dom";
import {userState} from "../../../../recoil/user/userState.ts";
import {MainButton} from "../../../uiParts/buttons/MainButton.tsx";
import {useAuthedEndpoint} from "../../../../hooks/useAuthedEndpoint.tsx";

export const NavigationBar: FC = memo(() => {
    const setAuthenticateToken = useSetRecoilState(authenticateState);
    const setUsername = useSetRecoilState(userState);
    const navigate = useNavigate();
    const {toastMessage} = useToastMessage();
    const {isOpen, onOpen, onClose} = useDisclosure();
    
    const axiosAuthedEndpoint = useAuthedEndpoint("http://localhost:8888");
    
    const onClickLogout = useCallback(() => {
        axiosAuthedEndpoint.delete("/logout")
            .then(() => {
                toastMessage({
                    title: "Logout success",
                    description: "Logout process complete. From now, the current refresh token is also invalid.",
                    status: "info"
                })
            })
            .catch((_) => {
                toastMessage({
                    title: "Logout process failed in server side",
                    description: "Refresh token valid until spend 1 hour by last access except logout process",
                    status: "warning"
                });
            })
            .finally(() => {
                setAuthenticateToken("");
                setUsername("");
                localStorage.removeItem("refreshToken");
                navigate("/");
            })
    }, [axiosAuthedEndpoint, navigate, setAuthenticateToken, setUsername, toastMessage]);
    
    return (
        <>
            <Flex as="aside" h="92%" flexDirection="column" justify="space-between">
                <Flex flexDirection="column" overflow="scroll">
                    {HomeNavigations.map(route => (
                        <IconButtonWithName key={route.pageName} icon={route.icon} w="100%">
                            {route.pageName}
                        </IconButtonWithName>
                    ))}
                </Flex>
                <IconButtonWithName
                    onClick={onOpen}
                    icon={<BiLogOut />}>ログアウト</IconButtonWithName>
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <Stack>
                        <ModalHeader>ログアウトして良いですか？</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>ログアウトボタンが押されました。本当にログアウトして良いですか？</ModalBody>
                        <MainButton onClick={onClickLogout}>はい</MainButton>
                    </Stack>
                </ModalContent>
            </Modal>
        </>
    )
});
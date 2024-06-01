import {FC, memo, useCallback} from "react";
import {Flex} from "@chakra-ui/react";
import {HomeNavigations} from "./HomeNavigations.tsx";
import {IconButtonWithName} from "../../../uiParts/buttons/IconButtonWithName.tsx";
import {BiLogOut} from "react-icons/bi";
import {useRecoilState, useSetRecoilState} from "recoil";
import {authenticateState} from "../../../../recoil/authentication/authenticateState.ts";
import axios from "axios";
import {useToastMessage} from "../../../../hooks/useToastMessage.tsx";
import {useNavigate} from "react-router-dom";
import {userState} from "../../../../recoil/user/userState.ts";

export const NavigationBar: FC = memo(() => {
    const [authenticateToken, setAuthenticateToken] = useRecoilState(authenticateState);
    const setUsername = useSetRecoilState(userState);
    const navigate = useNavigate();
    const {toastMessage} = useToastMessage();
    
    const onClickLogout = useCallback(() => {
        axios.delete("http://localhost:8888/v1/authed/logout", {
            headers: {
                Authorization: `Bearer ${authenticateToken}`
            }})
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
    }, [authenticateToken, navigate, setAuthenticateToken, setUsername, toastMessage]);
    
    return (
        <Flex as="aside" h="92%" flexDirection="column" justify="space-between">
            <Flex flexDirection="column" overflow="scroll">
                {HomeNavigations.map(route => (
                    <IconButtonWithName key={route.pageName} icon={route.icon} w="100%">
                        {route.pageName}
                    </IconButtonWithName>
                ))}
            </Flex>
            <IconButtonWithName
                onClick={onClickLogout}
                icon={<BiLogOut />}>ログアウト</IconButtonWithName>
        </Flex>
    )
});
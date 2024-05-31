import {FC, memo, ReactNode, useEffect} from "react";
import {useRecoilState, useSetRecoilState} from "recoil";
import {authenticateState} from "../recoil/authentication/authenticateState.ts";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {RefreshData, RefreshInput} from "../types/api/refresh.ts";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "../hooks/useToastMessage.tsx";
import {userState} from "../recoil/user/userState.ts";

type Props = {
    children: ReactNode;
}

export const RouteGuardUnAuthorize: FC<Props> = memo((props) => {
    const {children} = props;
    
    const [authenticate, setAuthenticate] = useRecoilState(authenticateState);
    const setUsername = useSetRecoilState(userState);
    const navigate = useNavigate();
    
    const { toastMessage } = useToastMessage();
    
    useEffect(() => {
        if (authenticate) return;
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            navigate("/");
            return;
        }
        
        const refreshInput: RefreshInput = {
            refresh_token: refreshToken,
        }
        axios.post<Response>("http://localhost:8888/v1/general/refresh", refreshInput)
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    if (!resData.request_success) {
                        toastMessage({
                            title: "Refresh token invalid",
                            description: "Refresh token invalid. Please login again.",
                            status: "error",
                        });
                        localStorage.removeItem("refreshToken");
                        navigate("/");
                    }
                    const refreshData: RefreshData = JSON.parse(resData.data);
                    if (refreshData.authenticated) {
                        setAuthenticate(refreshData.access_token);
                        setUsername(refreshData.username);
                    }
                }
                else {
                    toastMessage({
                        title: "Refresh request rejected",
                        description: "Please login again. If you face this error continuously, please contact the developer.",
                        status: "error"
                    });
                    localStorage.removeItem("refreshToken");
                    navigate("/");
                }
            })
            .catch(err => {
                const statusCode = err.response?.status;
                
                if (statusCode == 401) {
                    toastMessage({
                        title: "Refresh token expired",
                        description: "Your refresh token expired, please login again.",
                        status: "error",
                    });
                    localStorage.removeItem("refreshToken");
                    navigate("/");
                }
                else {
                    toastMessage({
                        title: "Refresh request failed",
                        description: "An error occurred while processing your request. " +
                            "\nIf you face this error continuously, please contact the developer.",
                        status: "error",
                    });
                    localStorage.removeItem("refreshToken");
                    navigate("/");
                }
            })
    }, [authenticate, navigate, setAuthenticate, setUsername, toastMessage]);
    
    return children;
});
import {useSetRecoilState} from "recoil";
import {userState} from "../recoil/user/userState.ts";
import {authenticateState} from "../recoil/authentication/authenticateState.ts";
import {useCallback} from "react";
import {RefreshData, RefreshInput} from "../types/api/refresh.ts";
import {useNavigate} from "react-router-dom";
import {useGeneralEndpoint} from "./useGeneralEndpoint.tsx";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "./useToastMessage.tsx";

export const useRefresh = () => {
    const setUsername = useSetRecoilState(userState);
    const setAccessToken = useSetRecoilState(authenticateState);
   
    const navigate = useNavigate();
    
    const axiosGeneralEndpoint = useGeneralEndpoint("http://localhost:8888");
    const {toastMessage} = useToastMessage();
    
    const refreshTrigger = useCallback(() => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            navigate("/");
            return;
        }
        
        const refreshInput: RefreshInput = {
            refresh_token: refreshToken,
        }
        
        axiosGeneralEndpoint.post<Response>("/refresh", refreshInput)
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
                        setAccessToken(refreshData.access_token);
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
            });
    }, [axiosGeneralEndpoint, navigate, setAccessToken, setUsername, toastMessage]);
    
    return {refreshTrigger}
}
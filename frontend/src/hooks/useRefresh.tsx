import {useSetRecoilState} from "recoil";
import {userState, UserStateType} from "../recoil/user/userState.ts";
import {accessTokenState} from "../recoil/authentication/accessTokenState.ts";
import {useCallback} from "react";
import {RefreshData, RefreshInput} from "../types/api/refresh.ts";
import {useNavigate} from "react-router-dom";
import {useGeneralEndpoint} from "./useGeneralEndpoint.tsx";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "./useToastMessage.tsx";
import {useTimestamp} from "./useTimestamp.tsx";

export const useRefresh = () => {
    const setUserState = useSetRecoilState(userState);
    const setAccessToken = useSetRecoilState(accessTokenState);
    const {convertEasyToReadTimestamp} = useTimestamp();
   
    const navigate = useNavigate();
    
    const axiosGeneralEndpoint = useGeneralEndpoint();
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
                        const createdDate = refreshData.created_datetime;
                        const date = new Date(createdDate);
                        const localDate = convertEasyToReadTimestamp(date);
                        const userState: UserStateType = {
                            userId: refreshData.user_id,
                            username: refreshData.username,
                            email: refreshData.email,
                            createdDateTime: localDate,
                        };
                        
                        setAccessToken(refreshData.access_token);
                        setUserState(userState);
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
    }, [axiosGeneralEndpoint, navigate, setAccessToken, setUserState, toastMessage]);
    
    return {refreshTrigger}
}
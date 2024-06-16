import {useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {useSetRecoilState} from "recoil";
import {userState} from "../recoil/user/userState.ts";
import {authenticateState} from "../recoil/authentication/authenticateState.ts";
import {useAuthedEndpoint} from "./useAuthedEndpoint.tsx";
import {Response} from "../types/api/response.ts";
import {LogoutInput} from "../types/api/logout.ts";
import {useToastMessage} from "./useToastMessage.tsx";
import {categoriesData} from "../recoil/category/categoryData.ts";

export const useLogout = () => {
    const setAccessToken = useSetRecoilState(authenticateState);
    const setUsername = useSetRecoilState(userState);
    const setCategories = useSetRecoilState(categoriesData);
    const navigate = useNavigate();
    
    const axiosAuthedEndpoint = useAuthedEndpoint("http://localhost:8888");
    const {toastMessage} = useToastMessage();
    
    const backendLogoutFailedToast = useCallback(() => {
        toastMessage({
            title: "Logout success but refresh token invalidation failed",
            description: "Refresh token cannot invalidate. Still valid on 1 hour. " +
                "If you face this warning continuously, please contact to developer.",
            status: "warning"
        });
    }, [toastMessage]);
    
    const onLogout = useCallback(() => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            localStorage.removeItem("refreshToken");
            setAccessToken("");
            setUsername("");
            setCategories([]);
            navigate("/");
            return;
        }
        
        const logoutInput: LogoutInput = {
            refresh_token: refreshToken
        }
        axiosAuthedEndpoint.post<Response>("logout", logoutInput)
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    if (!resData.request_success) {
                        backendLogoutFailedToast();
                    }
                    else {
                        toastMessage({
                            title: "Logout successful",
                            description: "Refresh token is also invalidated.",
                            status: "success",
                        })
                    }
                }
                else {
                    backendLogoutFailedToast();
                }
            })
            .catch(err => {
                const errorMessage = err.response?.data?.failed_reason;
                const statusCode = err.response?.status;
                if (statusCode !== 401) {
                    console.error(errorMessage);
                }
                backendLogoutFailedToast();
                
            })
            .finally(() => {
                localStorage.removeItem("refreshToken");
                setAccessToken("");
                setUsername("");
                setCategories([]);
                navigate("/");
            });
    }, [axiosAuthedEndpoint, backendLogoutFailedToast, navigate, setAccessToken, setCategories, setUsername, toastMessage]);
    
    return {onLogout}
}
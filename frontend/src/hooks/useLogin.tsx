import {useCallback, useState} from "react";
import {LoginData, LoginInput} from "../types/api/login.ts";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "./useToastMessage.tsx";
import {useNavigate} from "react-router-dom";
import {useSetRecoilState} from "recoil";
import {accessTokenState} from "../recoil/authentication/accessTokenState.ts";
import {userState, UserStateType} from "../recoil/user/userState.ts";
import {useGeneralEndpoint} from "./useGeneralEndpoint.tsx";

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuthenticate = useSetRecoilState(accessTokenState);
    const setUserState = useSetRecoilState(userState);
    const axiosGeneralEndpoint = useGeneralEndpoint();
    
    const {toastMessage} = useToastMessage();
    
    const loginAction = useCallback((loginInput: LoginInput) => {
        setLoading(true);
        
        axiosGeneralEndpoint.post<Response>("/login", loginInput)
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    if (!resData.request_success) {
                        const reason = resData.failed_reason || "any reason";
                        toastMessage({
                            title: "Login process failed",
                            description: `Login process failed by ${reason}. ` +
                                "\nPlease try later. " +
                                "\n If you face this error continuously, please contact the developer.",
                            status: "error"
                        });
                    }
                    const processResult: LoginData = JSON.parse(resData.data);
                    if (processResult.authenticated) {
                        localStorage.setItem("refreshToken", processResult.refresh_token);
                        const createdDate = processResult.created_datetime;
                        const localDate = new Date(createdDate).toLocaleString();
                        const userState: UserStateType = {
                            userId: processResult.user_id,
                            username: processResult.username,
                            email: processResult.email,
                            createdDateTime: localDate,
                        };
                        
                        setAuthenticate(processResult.access_token);
                        setUserState(userState);
                        
                        navigate("/home");
                    }
                }
                else {
                    toastMessage({
                        title: "Login request failed",
                        description: "Request response doesn't have any response. \nPlease try later.",
                        status: "error",
                    })
                }
            })
            .catch(err => {
                const statusCode = err.response?.status;
                if (statusCode === 401) {
                    toastMessage({
                        title: "Login failed",
                        description: "Invalid email or password",
                        status: "error",
                    })
                }
                else {
                    toastMessage({
                        title: "Login request failed",
                        description: "An error occurred while processing your request. " +
                            "\nPlease try again later. " +
                            "\nIf you face this error continuously, please contact the developer.",
                        status: "error",
                    })
                }
            })
            .finally(() => setLoading(false))
        
    }, [axiosGeneralEndpoint, navigate, setAuthenticate, setUserState, toastMessage]);
    
    return {loading, loginAction};
}
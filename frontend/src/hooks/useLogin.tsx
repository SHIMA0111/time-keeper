import {useCallback, useState} from "react";
import {LoginData, LoginInput} from "../types/api/login.ts";
import axios from "axios";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "./useToastMessage.tsx";
import {useNavigate} from "react-router-dom";
import {useSetRecoilState} from "recoil";
import {authenticateState} from "../recoil/authentication/authenticateState.ts";
import {userState} from "../recoil/user/userState.ts";

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuthenticate = useSetRecoilState(authenticateState);
    const setUsername = useSetRecoilState(userState);
    
    const {toastMessage} = useToastMessage();
    
    const loginAction = useCallback((loginInput: LoginInput) => {
        setLoading(true);
        
        axios.post<Response>("http://localhost:8888/v1/general/login", loginInput)
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
                        setAuthenticate(processResult.access_token);
                        setUsername(processResult.username);
                        
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
        
    }, [navigate, setAuthenticate, setUsername, toastMessage]);
    
    return {loading, loginAction};
}
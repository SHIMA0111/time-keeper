import {useCallback, useState} from "react";
import {LoginData, LoginInput, LoginResponse} from "../types/api/login.ts";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useToastMessage} from "./useToastMessage.tsx";

import init, {hash_from_str} from "wasm-tools";

export const useAuthentication = () => {
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const {toastMessage} = useToastMessage();

    const password_hashed = useCallback(async (password: string) => {
        await init();
        return hash_from_str(password);
    }, []);

    const loginCall = useCallback(async (mailAddress: string, password: string) => {
        setIsLoading(true);

        const hashedPassword = await password_hashed(password);
        const inputJson: LoginInput = {
            user_email: mailAddress,
            password: hashedPassword,
        };
        axios.post<LoginResponse>("http://localhost:8888/v1/general/login", inputJson)
            .then((res) => {
                if (res.data) {
                    const response = res.data;
                    const loginData: LoginData = JSON.parse(response.data);
                    toastMessage({
                        title: "Complete Log in to app!",
                        status: "success"
                    });
                    const accessToken = loginData.access_token;
                    const refreshToken = loginData.refresh_token;

                    sessionStorage.setItem("accessToken", accessToken);
                    sessionStorage.setItem("refreshToken", refreshToken);

                    navigate("/home");
                }
                else {
                    toastMessage({
                        title: "Something went wrong",
                        description:
                            "Authentication failed due to server not response correctly. Please try again. \n" +
                            "If you face this error in many times, please contact the developer.",
                        status: "error",
                    });
                }
            })
            .catch((err) => {
                const statusCode = err.response?.status;
                if (statusCode === 401) {
                    toastMessage({
                        title: "Failed to Entrance",
                        description: "Input email address or password is incorrect.",
                        status: "error",
                    });
                }
                else {
                    toastMessage({
                        title: "Temporal server error",
                        description: "Authenticate server return error. Please try again.",
                        status: "error",
                    })
                }
            })
            .finally(() => setIsLoading(false));
    }, [navigate, password_hashed, toastMessage]);
    
    return { loginCall, isLoading }
}
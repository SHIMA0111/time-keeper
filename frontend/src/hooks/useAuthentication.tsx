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

    const password_hashed = useCallback(async (password: string): Promise<string> => {
        return init().then(() => hash_from_str(password))
    }, []);

    const loginCall = useCallback(async (mailAddress: string, password: string) => {
        setIsLoading(true);

        const hashedPassword = await password_hashed(password);
        console.log(hashedPassword);
        const inputJson: LoginInput = {
            user_email: mailAddress,
            password: hashedPassword,
        };
        axios.post<LoginResponse>("http://localhost:8888/v1/general/login", inputJson)
            .then((res) => {
                if (res.data) {
                    const response = res.data;
                    const loginData: LoginData = JSON.parse(response.data);
                    if (loginData.authenticated) {
                        toastMessage({
                            title: "Login Success!",
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
                            title: "Login Failed...",
                            status: "error",
                        });
                    }
                }
                else {
                    toastMessage({
                        title: "Something went wrong",
                        status: "error",
                    });
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setIsLoading(false));
    }, [navigate, password_hashed, toastMessage]);
    
    return { loginCall, isLoading }
}
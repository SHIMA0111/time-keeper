import {useCallback, useState} from "react";
import {LoginInput, LoginResponse} from "../types/api/login.ts";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useToastMessage} from "./useToastMessage.tsx";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useAuthentication = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const {toastMessage} = useToastMessage();
    
    const loginCall = useCallback(async (mailAddress: string, password: string) => {
        setIsLoading(true);
        const nowDate = new Date();
        const currentData =
            nowDate.getUTCFullYear() + "-" +
            ("0" + (nowDate.getUTCMonth() + 1)).slice(-2) + "-" +
            ("0" + (nowDate.getUTCDate())).slice(-2) + "T" +
            ("0" + (nowDate.getUTCHours())).slice(-2) + ":" +
            ("0" + (nowDate.getUTCMinutes())).slice(-2) + ":" +
            ("0" + (nowDate.getUTCSeconds())).slice(-2);
        
        const tokenBase = currentData + "@" + mailAddress.split("@")[0];
        const token = btoa(tokenBase);
        
        const inputJson: LoginInput = {
            mail: mailAddress,
            password: password,
            validation_token: token,
        };
        await sleep(5000);
        axios.post<LoginResponse>("http://localhost:8888/login", inputJson)
            .then((res) => {
                if (res.data) {
                    if (res.data.is_authed) {
                        toastMessage({
                            title: "Login Success!",
                            status: "success"
                        });
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
    }, [navigate, toastMessage]);
    
    return { loginCall, isLoading }
}
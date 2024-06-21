import {useCallback, useState} from "react";
import {RegisterData, RegisterInput} from "../types/api/register.ts";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "./useToastMessage.tsx";
import {useNavigate} from "react-router-dom";
import {useGeneralEndpoint} from "./useGeneralEndpoint.tsx";

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const {toastMessage} = useToastMessage();
    const axiosGeneralEndpoint = useGeneralEndpoint();
    
    const registerAction = useCallback((registerInput: RegisterInput) => {
        setLoading(true);
        
        axiosGeneralEndpoint.post<Response>("/register", registerInput)
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    if (!resData.request_success) {
                        const reason = resData.failed_reason || "any reason";
                        toastMessage({
                            title: "Register process failed",
                            description: `Register process failed by ${reason}. ` +
                                "\nPlease try later. " +
                                "\n If you face this error continuously, please contact the developer.",
                            status: "error"
                        });
                    }
                    const processResult: RegisterData = JSON.parse(resData.data);
                    if (processResult.register) {
                        toastMessage({
                            title: "Register completed",
                            description: "Register process completed." +
                                "\nPlease login with the new account",
                            status: "success",
                        });
                        
                        navigate("/");
                    }
                }
                else {
                    toastMessage({
                        title: "Register request failed",
                        description: "Request response doesn't have any response. \nPlease try later.",
                        status: "error",
                    })
                }
            })
            .catch(err => {
                const statusCode = err.response?.status;
                if (statusCode === 401) {
                    toastMessage({
                        title: "Register failed",
                        description: "Invalid email or password",
                        status: "error",
                    })
                }
                else {
                    toastMessage({
                        title: "Register request failed",
                        description: "An error occurred while processing your request. " +
                            "\nPlease try again later. " +
                            "\nIf you face this error continuously, please contact the developer.",
                        status: "error",
                    })
                }
            })
            .finally(() => setLoading(false));
    }, [axiosGeneralEndpoint, navigate, toastMessage]);
    
    return {loading, registerAction};
}
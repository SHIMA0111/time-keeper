import {useCallback, useState} from "react";
import {RegisterData, RegisterInput} from "../types/api/register.ts";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "./useToastMessage.ts";
import {useNavigate} from "react-router-dom";
import {useGeneralEndpoint} from "./useGeneralEndpoint.ts";
import {HandleApiRequest} from "../utils/handleApiRequest.ts";

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const {toastMessage} = useToastMessage();
    const axiosGeneralEndpoint = useGeneralEndpoint();
    
    const registerAction = useCallback((registerInput: RegisterInput) => {
        setLoading(true);
        
        HandleApiRequest<RegisterData>(
            axiosGeneralEndpoint.post<Response>("/register", registerInput),
            "Register",
            (registerData) => {
                if (registerData.register) {
                    toastMessage({
                        title: "Register completed",
                        description: "Register process completed." +
                            "\nPlease login with the new account",
                        status: "success",
                    });
                    
                    navigate("/");
                }
            },
            false,
            toastMessage,
        ).finally(() => setLoading(false));
    }, [axiosGeneralEndpoint, navigate, toastMessage]);
    
    return {loading, registerAction};
}
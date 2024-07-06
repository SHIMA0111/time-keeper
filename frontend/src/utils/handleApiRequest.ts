import axios, {AxiosResponse} from "axios";
import {ToastProps} from "../hooks/useToastMessage.ts";
import {Response} from "../types/api/response.ts";

export const HandleApiRequest = async <T>(
    apiCall: Promise<AxiosResponse<Response>>,
    apiTitle: string,
    successCallback: (data: T) => void,
    useSuccessMessage: boolean = true,
    toastMessage: (params: ToastProps) => void,
    requestFailedText?: string) => {
    try {
        const res = await apiCall;
        if (!res.data) {
            throw new Error("Response has no data");
        }
        
        const resData = res.data;
        if (!resData.request_success) {
            throw new Error(requestFailedText || `Failed to ${apiTitle}`);
        }
        
        const parsedData: T = JSON.parse(resData.data);
        successCallback(parsedData);
        
        if (!useSuccessMessage) return;
        toastMessage({
            title: `${apiTitle} successful`,
            status: "success"
        });
    }
    catch (err) {
        console.error(`Error in ${apiTitle}`, err);
        if (axios.isAxiosError(err)) {
            toastMessage({
                title: `Failed to ${apiTitle} by axios error`,
                description: err.response?.data.failed_reason || "Unexpected error occurred",
                status: "error",
            });
        }
        else if (err instanceof Error) {
            toastMessage({
                title: err.message,
                description: `Unexpected error occurred while ${apiTitle} by ${err.name}`,
                status: "error",
            });
        }
        else {
            toastMessage({
                title: `Failed to ${apiTitle}`,
                status: "error",
            })
        }
        throw err;
    }
    
}
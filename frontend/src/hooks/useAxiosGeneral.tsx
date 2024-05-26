import {useCallback, useMemo, useState} from "react";
import axios from "axios";

export const useAxiosGeneral = <RS,>(host: string, port: number = 443) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [response, setResponse] = useState<RS | undefined>(undefined);
    
    const url: string = `${host}:${port}/v1/general`;
    
    const generalAxiosInstance = useMemo(() => axios.create({
        baseURL: url,
    }), [url]);
    
    const access = useCallback((endpoint: string, data: object) => {
        setIsLoading(true);
        generalAxiosInstance.post<RS>(endpoint, data)
            .then(res => {
                if (res.data) {
                    setResponse(res.data);
                    setIsSuccess(true);
                }
                else {
                    setIsSuccess(false);
                }
            })
            .catch(() => {
                setIsSuccess(false);
            })
            .finally(() => setIsLoading(false));
    }, [generalAxiosInstance]);
    
    return {access, response, isLoading, isSuccess}
};
import axios from "axios";
import {useMemo} from "react";
import {backendConfig} from "../config/backendConfig.ts";

export const useGeneralEndpoint = () => {
    const {apiUrl, port} = backendConfig;
    const axiosGeneralEndpoint = useMemo(() => {
        const url = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
        return axios.create({
            baseURL: `${url}:${port}/v1/general`,
            timeout: 5000
        })
    }, [apiUrl, port]);
    
    return axiosGeneralEndpoint;
}
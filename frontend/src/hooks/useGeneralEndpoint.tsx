import axios from "axios";
import {useMemo} from "react";

export const useGeneralEndpoint = (backend_url: string) => {
    const axiosGeneralEndpoint = useMemo(() => {
        const url = backend_url.endsWith("/") ? backend_url.slice(0, -1) : backend_url;
        return axios.create({
            baseURL: `${url}/v1/general`,
            timeout: 5000
        })
    }, [backend_url]);
    
    return axiosGeneralEndpoint;
}
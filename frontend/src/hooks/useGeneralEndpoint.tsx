import axios from "axios";

export const useGeneralEndpoint = (backend_url: string) => {
    const axiosGeneralEndpoint = axios.create({
        baseURL: `${backend_url}/v1/general`,
        timeout: 5000
    });
    
    return axiosGeneralEndpoint;
}
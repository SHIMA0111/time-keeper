import {useRecoilState} from "recoil";
import {accessTokenState} from "../recoil/authentication/accessTokenState.ts";
import axios, {AxiosInstance} from "axios";
import {useGeneralEndpoint} from "./useGeneralEndpoint.ts";
import {useNavigate} from "react-router-dom";
import {useMemo} from "react";
import {backendConfig} from "../config/backendConfig.ts";
import {TokenManager} from "../utils/tokenManager.ts";


export const useAuthedEndpoint = () => {
    const [accessToken, setAccessToken] = useRecoilState(accessTokenState);
    const navigate = useNavigate();
    const {apiUrl, port} = backendConfig;
    const axiosGeneralEndpoint = useGeneralEndpoint();
    
    const tokenManager =
        useMemo(() => new TokenManager(axiosGeneralEndpoint, setAccessToken, navigate),
            [axiosGeneralEndpoint, navigate, setAccessToken]);
    
    
    const axiosAuthedEndpoint: AxiosInstance = useMemo(() => {
        const url = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
        const instance =  axios.create({
            baseURL: `${url}:${port}/v1/authed`,
            timeout: 10000
        });
        
        instance.interceptors.request.use((config) => {
            if (!config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            
            return config;
        })
        
        instance.interceptors.response.use(
            response => response,
            async err => {
                const originalRequest = err.config;
                if (err.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const newToken = await tokenManager.refreshAccessToken();
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return instance(originalRequest);
                    }
                    catch (refreshErr) {
                        console.error("Token refresh failed: ", refreshErr);
                        return Promise.reject(refreshErr);
                    }
                }
                else if (err.response.status === 401) {
                    navigate("/");
                }
                return Promise.reject(err);
            }
        );
        
        return instance;
    }, [accessToken, apiUrl, navigate, port, tokenManager]);
    
    return axiosAuthedEndpoint;
}
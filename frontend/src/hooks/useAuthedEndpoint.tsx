import {useRecoilState} from "recoil";
import {accessTokenState} from "../recoil/authentication/accessTokenState.ts";
import axios, {AxiosInstance} from "axios";
import {useGeneralEndpoint} from "./useGeneralEndpoint.tsx";
import {RefreshData, RefreshInput} from "../types/api/refresh.ts";
import {Response} from "../types/api/response.ts";
import {useNavigate} from "react-router-dom";
import {useMemo} from "react";
import {backendConfig} from "../config/backendConfig.ts";

export const useAuthedEndpoint = () => {
    const [accessToken, setAccessToken] = useRecoilState(accessTokenState);
    const navigate = useNavigate();
    const {apiUrl, port} = backendConfig;
    
    const axiosAuthedEndpoint: AxiosInstance = useMemo(() => {
        const url = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
        return axios.create({
            baseURL: `${url}:${port}/v1/authed`,
            timeout: 10000,
        })
    }, [apiUrl, port]);
    const axiosGeneralEndpoint = useGeneralEndpoint();

    axiosAuthedEndpoint.interceptors.request.use(
        (requestValue) => {
            if (!requestValue.headers.Authorization) {
                requestValue.headers.Authorization = `Bearer ${accessToken}`;
            }
            return requestValue;
        }
    )

    axiosAuthedEndpoint.interceptors.response.use(
        response => response,
        async err => {
            const originalResponse = err.config;
            if (err.response.status === 401 && !originalResponse._retry) {
                originalResponse._retry = true;
                const refresh_token = localStorage.getItem("refreshToken");
                if (!refresh_token) {
                    navigate("/");
                    return Promise.reject(err);
                }
                const refresh_input: RefreshInput = {
                    refresh_token,
                };
                return axiosGeneralEndpoint.post<Response>("/refresh", refresh_input)
                    .then(async res => {
                        if (res.data) {
                            const resData: RefreshData = JSON.parse(res.data.data);
                            const newAccessToken = resData.access_token;
                            originalResponse.headers.Authorization = `Bearer ${newAccessToken}`;
                            setAccessToken(newAccessToken);
                            return axiosAuthedEndpoint(originalResponse)
                                .then(res => res)
                                .catch(err => Promise.reject(err));
                        }
                        else {
                            return Promise.reject(err);
                        }
                    })
                    .catch(_ => {
                        navigate("/");
                        return Promise.reject(err);
                    });
            }
            else if (err.response.status === 401) {
                navigate("/");
            }
            else {
                return Promise.reject(err);
            }

        }
    );

    return axiosAuthedEndpoint;
}
import {useRecoilState} from "recoil";
import {authenticateState} from "../recoil/authentication/authenticateState.ts";
import axios, {AxiosInstance} from "axios";
import {useGeneralEndpoint} from "./useGeneralEndpoint.tsx";
import {RefreshData, RefreshInput} from "../types/api/refresh.ts";
import {Response} from "../types/api/response.ts";
import {useNavigate} from "react-router-dom";
import {useMemo} from "react";

export const useAuthedEndpoint = (backend_url: string) => {
    const [accessToken, setAccessToken] = useRecoilState(authenticateState);
    const axiosGeneralEndpoint = useGeneralEndpoint("http://localhost:8888");
    const navigate = useNavigate();
    
    const axiosAuthedEndpoint: AxiosInstance = useMemo(() => {
        const url = backend_url.endsWith("/") ? backend_url.slice(0, -1) : backend_url;
        return axios.create({
            baseURL: `${url}/v1/authed`,
            timeout: 10000,
        })
    }, [backend_url]);

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
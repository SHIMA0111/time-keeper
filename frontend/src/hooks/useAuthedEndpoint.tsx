import {useRecoilState} from "recoil";
import {authenticateState} from "../recoil/authentication/authenticateState.ts";
import axios from "axios";
import {useGeneralEndpoint} from "./useGeneralEndpoint.tsx";
import {RefreshData, RefreshInput} from "../types/api/refresh.ts";
import {Response} from "../types/api/response.ts";

export const useAuthedEndpoint = (backend_url: string) => {
    const [accessToken, setAccessToken] = useRecoilState(authenticateState);
    const axiosGeneralEndpoint = useGeneralEndpoint("http://localhost:8888");

    const axiosAuthedEndpoint = axios.create({
        baseURL: `${backend_url}/v1/authed`,
        timeout: 10000,
    });

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
        err => {
            const originalResponse = err.config;
            if (err.response.status === 401 && !originalResponse._retry) {
                originalResponse._retry = true;
                const refresh_token = localStorage.getItem("refreshToken");
                if (!refresh_token) return Promise.reject(err);
                const refresh_input: RefreshInput = {
                    refresh_token: refresh_token
                };
                axiosGeneralEndpoint.post<Response>("/refresh", refresh_input)
                    .then(res => {
                        if (res.data) {
                            const resData: RefreshData = JSON.parse(res.data.data);
                            const newAccessToken = resData.access_token;
                            originalResponse.headers.Authorization = `Bearer ${newAccessToken}`;
                            setAccessToken(newAccessToken);
                            return axiosAuthedEndpoint(originalResponse);
                        }
                        else {
                            return Promise.reject(err);
                        }
                    })
                    .catch(_ => {
                        return Promise.reject(err);
                    });
            }
            else {
                return Promise.reject(err);
            }

        }
    );

    return axiosAuthedEndpoint;
}
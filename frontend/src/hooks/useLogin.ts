import {useCallback, useState} from "react";
import {LoginData, LoginInput} from "../types/api/login.ts";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "./useToastMessage.ts";
import {useNavigate} from "react-router-dom";
import {useSetRecoilState} from "recoil";
import {accessTokenState} from "../recoil/authentication/accessTokenState.ts";
import {userState, UserStateType} from "../recoil/user/userState.ts";
import {useGeneralEndpoint} from "./useGeneralEndpoint.ts";
import {useTimestamp} from "./useTimestamp.ts";
import {HandleApiRequest} from "../utils/handleApiRequest.ts";

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuthenticate = useSetRecoilState(accessTokenState);
    const setUserState = useSetRecoilState(userState);
    const axiosGeneralEndpoint = useGeneralEndpoint();
    const {convertEasyToReadTimestamp} = useTimestamp();
    
    const {toastMessage} = useToastMessage();
    
    const loginAction = useCallback(async (loginInput: LoginInput) => {
        setLoading(true);
        HandleApiRequest<LoginData>(
            axiosGeneralEndpoint.post<Response>("/login", loginInput),
            "login",
            (loginData) => {
                if (!loginData.authenticated) {
                    throw new Error("Username or Password is not match");
                }
                localStorage.setItem("refreshToken", loginData.refresh_token);
                const createdDate = loginData.created_datetime;
                const date = new Date(createdDate);
                const localDate = convertEasyToReadTimestamp(date);
                
                const authedUserData: UserStateType = {
                    userId: loginData.user_id,
                    username: loginData.username,
                    email: loginData.email,
                    createdDateTime: localDate,
                };
                
                setAuthenticate(loginData.access_token);
                setUserState(authedUserData);
                navigate("/home");
            },
            false,
            toastMessage,
        ).finally(() => setLoading(false));
        
    }, [axiosGeneralEndpoint, convertEasyToReadTimestamp, navigate, setAuthenticate, setUserState, toastMessage]);
    
    return {loading, loginAction};
}
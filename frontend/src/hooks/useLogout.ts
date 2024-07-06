import {useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {useSetRecoilState} from "recoil";
import {userState, UserStateType} from "../recoil/user/userState.ts";
import {accessTokenState} from "../recoil/authentication/accessTokenState.ts";
import {useAuthedEndpoint} from "./useAuthedEndpoint.ts";
import {Response} from "../types/api/response.ts";
import {LogoutInput} from "../types/api/logout.ts";
import {useToastMessage} from "./useToastMessage.ts";
import {categoriesData} from "../recoil/category/categoryData.ts";
import {HandleApiRequest} from "../utils/handleApiRequest.ts";

export const useLogout = () => {
    const setAccessToken = useSetRecoilState(accessTokenState);
    const setUsername = useSetRecoilState(userState);
    const setCategories = useSetRecoilState(categoriesData);
    const navigate = useNavigate();
    
    const axiosAuthedEndpoint = useAuthedEndpoint();
    const {toastMessage} = useToastMessage();
    
    const onLogout = useCallback(() => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            localStorage.removeItem("refreshToken");
            setAccessToken("");
            setUsername({} as UserStateType);
            setCategories([]);
            navigate("/");
            return;
        }
        
        const logoutInput: LogoutInput = {
            refresh_token: refreshToken
        }
        
        HandleApiRequest<void>(
            axiosAuthedEndpoint.post<Response>("logout", logoutInput),
            "Logout",
            () => {},
            true,
            toastMessage,
            "Refresh token cannot invalidate. Still valid on 1 hour. " +
            "If you face this warning continuously, please contact to developer."
        ).finally(() => {
            localStorage.removeItem("refreshToken");
            setAccessToken("");
            setUsername({} as UserStateType);
            setCategories([]);
            navigate("/");
        });
    }, [axiosAuthedEndpoint, navigate, setAccessToken, setCategories, setUsername, toastMessage]);
    
    return {onLogout}
}
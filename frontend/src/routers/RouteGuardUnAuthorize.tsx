import {FC, memo, ReactNode, useEffect, useState} from "react";
import {useRecoilState, useSetRecoilState} from "recoil";
import {authenticateState} from "../recoil/authentication/authenticateState.ts";
import {useNavigate} from "react-router-dom";
import {RefreshData, RefreshInput} from "../types/api/refresh.ts";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "../hooks/useToastMessage.tsx";
import {userState} from "../recoil/user/userState.ts";
import {useGeneralEndpoint} from "../hooks/useGeneralEndpoint.tsx";
import {Loading} from "../components/pages/Loading.tsx";
import {selectedCategoryState, SelectedCategoryType} from "../recoil/category/selectedCategoryState.ts";
import {tempSelectedCategoryState} from "../recoil/category/tempSelectedCategoryState.ts";

type Props = {
    children: ReactNode;
}

export const RouteGuardUnAuthorize: FC<Props> = memo((props) => {
    const {children} = props;
    
    const [shouldRenderChildren, setShouldRenderChildren] = useState(false);
    const [authenticate, setAuthenticate] = useRecoilState(authenticateState);
    const setUsername = useSetRecoilState(userState);
    const setSelectedCategory = useSetRecoilState(selectedCategoryState);
    const setTempSelectedCategory = useSetRecoilState(tempSelectedCategoryState);
    const navigate = useNavigate();
    
    const { toastMessage } = useToastMessage();
    const axiosGeneralEndpoint = useGeneralEndpoint("http://localhost:8888");
    
    useEffect(() => {
        const selectedCategoryJson = localStorage.getItem("categorySetting");
        if (selectedCategoryJson) {
            const selectedCategory: SelectedCategoryType = JSON.parse(selectedCategoryJson);
            if (selectedCategory.top && !isNaN(Number(selectedCategory.top.id))) {
                setSelectedCategory(selectedCategory);
                setTempSelectedCategory(selectedCategory);
            }
        }
        
        if (authenticate) {
            setShouldRenderChildren(true);
            return;
        }
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            navigate("/");
            return;
        }
        
        const refreshInput: RefreshInput = {
            refresh_token: refreshToken,
        }
        axiosGeneralEndpoint.post<Response>("/refresh", refreshInput)
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    if (!resData.request_success) {
                        toastMessage({
                            title: "Refresh token invalid",
                            description: "Refresh token invalid. Please login again.",
                            status: "error",
                        });
                        localStorage.removeItem("refreshToken");
                        navigate("/");
                    }
                    const refreshData: RefreshData = JSON.parse(resData.data);
                    if (refreshData.authenticated) {
                        setAuthenticate(refreshData.access_token);
                        setUsername(refreshData.username);
                    }
                }
                else {
                    toastMessage({
                        title: "Refresh request rejected",
                        description: "Please login again. If you face this error continuously, please contact the developer.",
                        status: "error"
                    });
                    localStorage.removeItem("refreshToken");
                    navigate("/");
                }
            })
            .catch(err => {
                const statusCode = err.response?.status;
                
                if (statusCode == 401) {
                    toastMessage({
                        title: "Refresh token expired",
                        description: "Your refresh token expired, please login again.",
                        status: "error",
                    });
                    localStorage.removeItem("refreshToken");
                    navigate("/");
                }
                else {
                    toastMessage({
                        title: "Refresh request failed",
                        description: "An error occurred while processing your request. " +
                            "\nIf you face this error continuously, please contact the developer.",
                        status: "error",
                    });
                    localStorage.removeItem("refreshToken");
                    navigate("/");
                }
            })
            .finally(() => setShouldRenderChildren(true));
    }, [authenticate, axiosGeneralEndpoint, navigate, setAuthenticate, setSelectedCategory, setTempSelectedCategory, setUsername, toastMessage]);
    
    return shouldRenderChildren ? children : <Loading />;
});
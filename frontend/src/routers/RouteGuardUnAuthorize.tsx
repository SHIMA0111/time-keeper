import {FC, memo, ReactNode, useEffect, useState} from "react";
import {useRecoilState, useSetRecoilState} from "recoil";
import {accessTokenState} from "../recoil/authentication/accessTokenState.ts";
import {useNavigate} from "react-router-dom";
import {useToastMessage} from "../hooks/useToastMessage.tsx";
import {userState, UserStateType} from "../recoil/user/userState.ts";
import {Loading} from "../components/pages/Loading.tsx";
import {categoriesData} from "../recoil/category/categoryData.ts";
import {useRefresh} from "../hooks/useRefresh.tsx";
import {useCategory} from "../hooks/useCategory.tsx";

type Props = {
    children: ReactNode;
}

export const RouteGuardUnAuthorize: FC<Props> = memo((props) => {
    const {children} = props;
    
    const [shouldRenderChildren, setShouldRenderChildren] = useState(false);
    const [authenticate, setAuthenticate] = useRecoilState(accessTokenState);
    const setUsername = useSetRecoilState(userState);
    const setCategoryData = useSetRecoilState(categoriesData);
    const navigate = useNavigate();
    
    const { toastMessage } = useToastMessage();
    const { refreshTrigger } = useRefresh();
    const { categoryGetTrigger } = useCategory();
    
    useEffect(() => {
        if (authenticate) {
            categoryGetTrigger();
            setShouldRenderChildren(true);
            return;
        }
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            setAuthenticate("");
            setUsername({} as UserStateType);
            setCategoryData([]);
            navigate("/");
            return;
        }
        
        refreshTrigger();
        categoryGetTrigger();
        setShouldRenderChildren(true);
        
    }, [authenticate, categoryGetTrigger, navigate, refreshTrigger, setAuthenticate, setCategoryData, setUsername, toastMessage]);
    
    return shouldRenderChildren ? children : <Loading />;
});
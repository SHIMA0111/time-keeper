import {FC, memo, ReactNode, useCallback, useEffect, useState} from "react";
import {useSetRecoilState} from "recoil";
import {accessTokenState} from "../recoil/authentication/accessTokenState.ts";
import {useNavigate} from "react-router-dom";
import {useToastMessage} from "../hooks/useToastMessage.ts";
import {userState, UserStateType} from "../recoil/user/userState.ts";
import {Loading} from "../components/pages/Loading.tsx";
import {categoriesData} from "../recoil/category/categoryData.ts";
import {useCategory} from "../hooks/useCategory.ts";
import {useUserdata} from "../hooks/useUserdata.ts";

type Props = {
    children: ReactNode;
}

export const RouteGuardUnAuthorize: FC<Props> = memo((props) => {
    const {children} = props;
    
    const [shouldRenderChildren, setShouldRenderChildren] = useState(false);
    const setAuthenticate = useSetRecoilState(accessTokenState);
    const setUsername = useSetRecoilState(userState);
    const setCategoryData = useSetRecoilState(categoriesData);
    const navigate = useNavigate();
    
    const { categoryGetTrigger } = useCategory();
    const { toastMessage } = useToastMessage();
    const { refreshUserData } = useUserdata();
    
    const handleAuthentication = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                setAuthenticate("");
                setUsername({} as UserStateType);
                setCategoryData([]);
                navigate("/");
                return;
            }
            else {
                await categoryGetTrigger();
                await refreshUserData();
                setShouldRenderChildren(true);
            }
        }
        catch (err) {
            console.error("Authentication error", err);
            toastMessage({
                title: "Failed to get authentication",
                status: "error",
            });
            navigate("/");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        handleAuthentication().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    return shouldRenderChildren ? children : <Loading />;
});
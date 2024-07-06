import {useRecoilState} from "recoil";
import {userState, UserStateType} from "../recoil/user/userState.ts";
import {useCallback} from "react";
import {HandleApiRequest} from "../utils/handleApiRequest.ts";
import {useAuthedEndpoint} from "./useAuthedEndpoint.ts";
import {Response} from "../types/api/response.ts";
import {UserResponse} from "../types/api/user.ts";
import {useTimestamp} from "./useTimestamp.ts";
import {useToastMessage} from "./useToastMessage.ts";

export const useUserdata = () => {
    const [userData, setUserData] = useRecoilState(userState);
    const authedEndpoint = useAuthedEndpoint();
    const {convertEasyToReadTimestamp} = useTimestamp();
    const {toastMessage} = useToastMessage();
    
    const refreshUserData = useCallback(async () => {
        if (userData.userId) {
            return;
        }
        await HandleApiRequest<UserResponse>(
            authedEndpoint.get<Response>("/user"),
            "get user data",
            (userData) => {
                const createdDate = userData.created_time;
                const date = new Date(createdDate);
                const localDate = convertEasyToReadTimestamp(date);
                
                const tmpUserData: UserStateType = {
                    userId: userData.user_id,
                    username: userData.username,
                    email: userData.email,
                    createdDateTime: localDate,
                };
                setUserData(tmpUserData);
            },
            false,
            toastMessage
        );
    }, [authedEndpoint, convertEasyToReadTimestamp, setUserData, toastMessage, userData.userId]);
    
    return {refreshUserData}
}
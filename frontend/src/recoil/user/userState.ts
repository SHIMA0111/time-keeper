import {atom} from "recoil";

export type UserStateType = {
    userId: string;
    username: string;
    email: string;
    createdDateTime: string;
}

export const userState = atom<UserStateType>({
    key: "userState",
    default: {
        userId: "",
        username: "",
        email: "",
        createdDateTime: "",
    },
});
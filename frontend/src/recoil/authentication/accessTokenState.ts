import {atom} from "recoil";

export const accessTokenState = atom<string>({
    key: "accessTokenState",
    default: "",
});
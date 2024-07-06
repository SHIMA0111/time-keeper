import {atom} from "recoil";
import {TokenManager} from "../utils/tokenManager.ts";

export const tokenManagerState = atom<TokenManager | null>({
    key: 'tokenManagerState',
    default: null
});
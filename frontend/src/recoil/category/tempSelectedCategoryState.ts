import {atom} from "recoil";
import {SelectedCategoryType} from "./selectedCategoryState.ts";


export const tempSelectedCategoryState = atom<SelectedCategoryType>({
    key: "tempSelectedCategoryState",
    default: {
        top: {id: -99, name: ""},
        sub1: null,
        sub2: null,
        sub3: null,
        sub4: null,
    },
});
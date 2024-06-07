import {CategoryName} from "../../types/api/categoryName.ts";
import {atom} from "recoil";

export type AllCategoryType = {
    top: CategoryName[],
    sub1: CategoryName[],
    sub2: CategoryName[],
    sub3: CategoryName[],
    sub4: CategoryName[],
};

export const allCategoryState = atom<AllCategoryType>({
    key: "allCategoryState",
    default: {
        top: [],
        sub1: [],
        sub2: [],
        sub3: [],
        sub4: [],
    }
})

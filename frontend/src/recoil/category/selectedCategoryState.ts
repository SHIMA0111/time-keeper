import {atom} from "recoil";

export type CategoryPair = {
    id: number,
    name: string,
}

export type SelectedCategoryType = {
    top: CategoryPair,
    sub1: CategoryPair | null,
    sub2: CategoryPair | null,
    sub3: CategoryPair | null,
    sub4: CategoryPair | null,
}

export const selectedCategoryState = atom<SelectedCategoryType>({
    key: "selectedCategoryState",
    default: {
        top: {id: -99, name: ""},
        sub1: null,
        sub2: null,
        sub3: null,
        sub4: null,
    },
});

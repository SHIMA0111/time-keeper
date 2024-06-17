import {atom} from "recoil";
import {CategoryContent} from "./categoryData.ts";

export type SelectedCategoryType = {
    aliasId: string | undefined;
    main_category: CategoryContent | undefined;
    sub1_category: CategoryContent | undefined;
    sub2_category: CategoryContent | undefined;
    sub3_category: CategoryContent | undefined;
    sub4_category: CategoryContent | undefined;
}

export const selectedCategoryData = atom<SelectedCategoryType>({
    key: 'selectedCategoryData',
    default: {
        aliasId: undefined,
        main_category: undefined,
        sub1_category: undefined,
        sub2_category: undefined,
        sub3_category: undefined,
        sub4_category: undefined,
    },
})
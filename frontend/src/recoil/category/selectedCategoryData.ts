import {atom} from "recoil";
import {CategoryContent} from "./categoryData.ts";

export const selectedCategoryData = atom<CategoryContent[]>({
    key: 'selectedCategoryData',
    default: [],
})
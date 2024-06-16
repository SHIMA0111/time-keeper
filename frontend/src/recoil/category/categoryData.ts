import {atom} from "recoil";

export type CategoryContent = {
    id: string;
    name: string;
    superior_id: string | undefined;
};

export type CategoryData = {
    table_name: string;
    display_name: string;
    categories: CategoryContent[];
}

export const categoriesData = atom<CategoryData[]>({
    key: 'categoryData',
    default: [],
});

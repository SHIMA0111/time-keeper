import {SelectedCategoryType} from "../../recoil/category/selectedCategoryState.ts";

export type AliasInput = {
    alias_name: string;
    top_id: number,
    sub1_id?: number,
    sub2_id?: number,
    sub3_id?: number,
    sub4_id?: number,
}

export type AliasResponse = SelectedCategoryType;

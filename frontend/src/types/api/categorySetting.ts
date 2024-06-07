export type CategorySetting = {
    top: Names,
    sub1: Names | null,
    sub2: Names | null,
    sub3: Names | null,
    sub4: Names | null,
    contents_num: number,
}

export type Names = {
    table_name: string;
    display_name: string;
}

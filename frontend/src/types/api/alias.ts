export type AliasInput = {
    alias_name: string;
    main_id: string;
    sub1_id: string | undefined;
    sub2_id: string | undefined;
    sub3_id: string | undefined;
    sub4_id: string | undefined;
    is_auto_registered: boolean;
}

export type AliasResponse = {
    alias_id: string;
}

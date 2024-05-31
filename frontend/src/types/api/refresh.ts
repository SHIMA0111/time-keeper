export type RefreshInput = {
    refresh_token: string;
}

export type RefreshData = {
    authenticated: boolean;
    access_token: string;
    username: string;
}

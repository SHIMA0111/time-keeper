export type RefreshInput = {
    refresh_token: string;
}

export type RefreshData = {
    authenticated: boolean;
    access_token: string;
    user_id: string;
    username: string;
    email: string;
    created_datetime: string;
}

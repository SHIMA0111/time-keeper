export type LoginInput = {
    user_email: string;
    password: string;
}

export type LoginData = {
    authenticated: boolean;
    access_token: string;
    refresh_token: string;
    user_id: string;
    username: string;
    email: string;
    created_datetime: string;
}

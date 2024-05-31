export type LoginInput = {
    user_email: string;
    password: string;
}

export type LoginData = {
    authenticated: boolean;
    access_token: string;
    refresh_token: string;
    username: string;
}

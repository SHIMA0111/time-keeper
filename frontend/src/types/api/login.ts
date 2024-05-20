export const EmailPattern = /[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[a-z0-9.]+/;

export type LoginInput = {
    user_email: string,
    password: string,
}

export type LoginResponse = {
    request_success: boolean,
    data: string,
    failed_reason: string | null,
    endpoint: string,
}

export type LoginData = {
    authenticated: boolean,
    access_token: string,
    refresh_token: string,
}

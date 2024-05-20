export const EmailPattern = /[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[a-z0-9.]+/;

export type LoginInput = {
    mail: string,
    password: string,
    validation_token: string,
}

export type LoginResponse = {
    is_authed: boolean
}

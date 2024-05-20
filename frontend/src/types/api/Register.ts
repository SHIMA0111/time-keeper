export type RegisterRequest = {
    email: string;
    password: string;
    username: string;
}

export type RegisterResponse = {
    success: boolean;
    reason: number;
}
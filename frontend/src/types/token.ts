export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface RefreshSubscriber {
    resolve: (value: string | PromiseLike<string>) => void;
    reject: (reason?: unknown) => void;
}
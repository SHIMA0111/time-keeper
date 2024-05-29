export type Response = {
    request_success: boolean,
    data: string,
    failed_reason: string | null,
    endpoint: string,
};
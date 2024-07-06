import {RefreshSubscriber} from "../types/token.ts";
import {AxiosInstance} from "axios";
import {RefreshData, RefreshInput} from "../types/api/refresh.ts";
import {Response} from "../types/api/response.ts";

export class TokenManager {
    private isRefreshing: boolean = false;
    private refreshSubscribers: RefreshSubscriber[] = [];
    
    constructor(
        private readonly generalEndpoint: AxiosInstance,
        private readonly setAccessToken: (token: string) => void,
        private readonly navigate: (path: string) => void,
    ) {}
    
    async refreshAccessToken(): Promise<unknown> {
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.refreshSubscribers.push({ resolve, reject });
            });
        }
        
        this.isRefreshing = true;
        
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                this.handleRefreshFailure(new Error("No refresh token"));
                return Promise.reject("No refresh token");
            }
            
            const refreshInput: RefreshInput = { refresh_token: refreshToken };
            
            const res = await this.generalEndpoint.post<Response>("/refresh", refreshInput);
            
            if (res.data) {
                const resData: RefreshData = JSON.parse(res.data.data);
                const newAccessToken = resData.access_token;
                this.setAccessToken(newAccessToken);
                
                this.refreshSubscribers.forEach(({ resolve }) => resolve(newAccessToken));
                this.refreshSubscribers = [];
                
                return newAccessToken;
            }
            else {
                this.handleRefreshFailure(new Error("Refresh failed"));
                return Promise.reject("Refresh failed");
            }
        }
        catch (err) {
            this.handleRefreshFailure(err);
            return Promise.reject(err);
        }
        finally {
            this.isRefreshing = false;
        }
    }
    
    private handleRefreshFailure(err: unknown): void {
        this.refreshSubscribers.forEach(({ reject }) => reject(err));
        this.refreshSubscribers = [];
        localStorage.removeItem("refreshToken");
        this.setAccessToken("");
        this.navigate("/");
    }
}

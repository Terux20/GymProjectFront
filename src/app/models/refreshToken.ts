export interface RefreshToken {
    token: string;
    expiration: Date;
}

export interface TokenResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        refreshToken: string;
        expiration: Date;
    };
}
export interface IAuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
    };
    accessToken: string;
}

export interface IResponse<T = null> {
    data: T;
    message: string;
}
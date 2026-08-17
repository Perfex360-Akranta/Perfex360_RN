import { authGet, authPost } from "./axiosService";

export interface LoginRequest {
    username: string;
    password: string;
}

export const login = async (data: LoginRequest) => {

    const response = await authPost('auth/login', data);

    return response;
};

export const getUserDetails = async (id :string) => {

    const response = await authGet('auth/login-header-context', id);

    return response;
};
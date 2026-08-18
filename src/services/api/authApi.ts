import { authGet, authPost , get } from "../axiosService";

export interface LoginRequest {
    username: string;
    password: string;
}

export const login = async (data: LoginRequest) => {

    const response = await authPost('auth/login', data);

    return response;
};

export const getUserDetails = async (id :string) => {

    const response = await authGet('auth/login-header-context', null, id);

    return response;
};

export const getCurrentShift = async () => {

    const response = await get('pcs/getCurrentShift');

    return response;
};
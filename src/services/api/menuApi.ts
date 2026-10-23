import { post, get } from '../axiosService';

export const getMenuData = async (
    parentNumber: string,
    userId: string
): Promise<MenuItem[]> => {
    const response = await get("/menu/getAllMenuTree", { parentNumber,userId});

    return response;
};
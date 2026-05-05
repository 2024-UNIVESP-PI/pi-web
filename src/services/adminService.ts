import api from ".";

export type AdminLoginData = {
  username: string;
  password: string;
};

export const loginAdmin = async (data: AdminLoginData) =>
  await api.post("movimentacao/admin-login/", data);

const adminService = {
  loginAdmin,
};

export default adminService;

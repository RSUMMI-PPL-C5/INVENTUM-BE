import bcrypt from "bcrypt";
import { IUser } from "../interfaces/user.interface";

// Dummy
const users: IUser[] = [
    { id: 1, nokar: "001", fullname: "Harry Maguire", username: "upamaguire123", role: 3, password: "hashedpassword1", divisi_id: 1, wa_number: "1234567890", CreatedBy: 1, CreatedOn: new Date(), ModifiedOn: new Date() },
    { id: 2, nokar: "002", fullname: "Ronaldo", username: "siuuuu123", role: 1, password: "hashedpassword2", divisi_id: 2, wa_number: "0987654321", CreatedBy: 1, CreatedOn: new Date(), ModifiedOn: new Date() },
];

export const getUsers = (): IUser[] => {
    return users;
};

export const getUserById = (id: number): IUser | undefined => {
    return users.find((u) => u.id === id);
};

export const updateUser = async (id: number, data: Partial<IUser>): Promise<IUser | undefined | null> => {
    const user = users.find((u) => u.id === id);
    if (!user) {
        return undefined;
    }

    const { fullname, role, password, divisi_id, wa_number, ModifiedBy } = data;

    // Validasi data yang diperlukan
    if (!ModifiedBy || (fullname !== undefined && fullname.length < 3)) {
        return null;
    }

    // Perbarui hanya parameter yang diberikan
    if (fullname !== undefined) user.fullname = fullname;
    if (role !== undefined) user.role = role;
    if (divisi_id !== undefined) user.divisi_id = divisi_id;
    if (wa_number !== undefined) user.wa_number = wa_number;
    if (password !== undefined) {
        user.password = await bcrypt.hash(password, 10);
    }
    user.ModifiedBy = ModifiedBy;
    user.ModifiedOn = new Date();

    return user;
};
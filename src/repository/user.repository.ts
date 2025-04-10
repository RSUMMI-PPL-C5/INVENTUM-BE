import { PrismaClient, Prisma, User } from "@prisma/client";
import { UserDTO, AddUserResponseDTO } from "../dto/user.dto";

import prisma from "../configs/db.config";

class UserRepository {
	private readonly prisma: PrismaClient;

	constructor() {
		this.prisma = prisma;
	}

    public async createUser(userData: any): Promise<AddUserResponseDTO> {
		const newUser = await this.prisma.user.create({
			data: userData,
			select: {
				id: true,
				email: true,
				username: true,
			},
		});

		return newUser;
	}

	public async getUsers(): Promise<UserDTO[]> {
		return await this.prisma.user.findMany();
	}

	public async getFilteredUsers(
		whereClause: Prisma.UserWhereInput
	): Promise<UserDTO[]> {
		return await prisma.user.findMany({ where: whereClause });
	}

	public async getUserById(id: string): Promise<UserDTO | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                divisi: true
            }
        });
    
        if (!user) {
            return null;
        }
    
        return {
            ...user,
            divisionName: user.divisi?.divisi || null
        };
    }

	public async getUserByEmail(email: string): Promise<UserDTO | null> {
		return await this.prisma.user.findUnique({
			where: { email },
		});
	}

	public async findUsersByName(nameQuery: string): Promise<User[]> {
		return await prisma.user.findMany({
			where: {
				fullname: {
					contains: nameQuery,
				},
			},
		});
	}

	public async findByUsername(username: string): Promise<UserDTO | null> {
		return await this.prisma.user.findUnique({
			where: { username },
		});
	}

	public async updateUser(
		id: string,
		data: Partial<UserDTO>
	): Promise<UserDTO | null> {
		return await this.prisma.user.update({
			where: { id },
			data,
		});
	}

	public async deleteUser(id: string): Promise<UserDTO | null> {
		return await this.prisma.user.delete({
			where: { id },
		});
	}
}

export default UserRepository;

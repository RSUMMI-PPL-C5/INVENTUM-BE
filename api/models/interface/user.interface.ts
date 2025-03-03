export interface IUserRepository{
    findByUsername(username: string): Promise<any>;
}
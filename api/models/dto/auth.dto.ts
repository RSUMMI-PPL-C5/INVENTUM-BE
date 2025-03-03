export interface LoginRequestDTO{
    username: String;
    password: String;
}

export interface LoginResponseDTO{
    id: String;
    username: String;
    email: String;
    token: String;
    role: String | null; //still hazy on how this works
}
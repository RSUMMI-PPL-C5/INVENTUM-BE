import { AuthService } from "../../../services/auth.service";
import { LoginRequestDTO, LoginResponseDTO } from "../../../models/dto/auth.dto";
import bcrypt from "bcrypt";
import exp from "constants";


describe ('AuthService', () => {
    let authservice: AuthService;
    let mockUserRepository: any;
    let mockTokenService: any;

    beforeEach(() => {
        mockUserRepository = {
            findByUsername: jest.fn(),
        };
        
        mockTokenService = {
            generateToken: jest.fn(),
        };

        authservice = new AuthService(mockUserRepository, mockTokenService);
    });

    describe('ValidateUser', () => {
        it('should return user object if user is found/valid (password should be encrypted)', async () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password', 10),
                role: 'user',
            };

            mockUserRepository.findByUsername.mockResolvedValue(mockUser);

            //action
            const result = await authservice.validateUser('testuser', 'password');

            //and assertion
            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('testuser');
            expect(result).toEqual(mockUser);
            expect(result.password).toBeUndefined();
        });

        it('should return null if user is not found', async () => {
            mockUserRepository.findByUsername.mockResolvedValue(null);

            const result = await authservice.validateUser('notestuser', 'password');

            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('notestuser');
            expect(result).toBeNull();
        });

        it('should return null if password is incorrect', async () => {
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                role: 'user'
            };

            mockUserRepository.findByUsername.mockResolvedValue(mockUser);

            const result = await authservice.validateUser('testuser', 'password');

            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('testuser');
            expect(result).toBeNull();
        });
    });
});

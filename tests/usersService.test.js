const UsersService = require('../services/usersService');
const UsersRepository = require('../repositories/usersRepository');
const sequelize = require('../db/models/index').sequelize;
const Users = require('../db/models').Users;
jest.mock('../repositories/usersRepository'); // Mock the UsersRepository
// Mock the Users model using Jest
jest.mock("../db/models");

// Add this mock before your describe block
jest.mock('../db/models/index', () => ({
  sequelize: {
    transaction: jest.fn()
  },
  Users: jest.fn(),  // Changed this line to avoid circular dependency
  Events: jest.fn()
}));
describe('UsersService', () => {
    // Sample data for testing
    const sampleUser = {
        id: '1e8b7c18-e96f-4a8d-9e15-0f5e45e3481f',
        name: 'purple cactus',
        email: 'purple@cactus.com',
        contactNumber: "12345678",
        password: "$2b$12$Heuxw.RM8uMsG0vBXciG.OwEaJ/R5ND94oOPY9ZqbMUnTA3TWjRc",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    let mockTransaction;
    beforeEach(() => {
        // Setup mock methods for Users
        Users.create = jest.fn();
        Users.findByPk = jest.fn();
        Users.update = jest.fn();
        Users.findOne = jest.fn();
        Users.destroy = jest.fn();
        Users.findAll = jest.fn();
        Users.findOrCreate = jest.fn();

        mockTransaction = {
          commit: jest.fn(),
          rollback: jest.fn(),
        };

        sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
        jest.clearAllMocks(); // Clear previous calls and instances
    });

    test('should create an user', async () => {
        const userData = { sampleUser };
        UsersRepository.CreateAsync.mockResolvedValue(userData); // Mock the Create method

        const result = await UsersService.CreateUserAsync(userData);
        expect(result).toEqual(userData); // Assert the result matches the input data
        expect(UsersRepository.CreateAsync).toHaveBeenCalledWith(userData); // Ensure the repository method was called correctly
    });

    test('should get an user by id', async () => {
        const userId = sampleUser.id;
        const userData = { sampleUser };
        UsersRepository.GetByIdAsync.mockResolvedValue(userData); // Mock the GetById method

        const result = await UsersService.GetUserByIdAsync(userId);
        expect(result).toEqual(userData); // Assert the returned data is correct
        expect(UsersRepository.GetByIdAsync).toHaveBeenCalledWith(userId); // Check if the repository method was called correctly
    });

    test('should update an user', async () => {
        const userId = sampleUser.id;
        const updatedData = { userName: 'Updated User' };
        const updatedUser = { ...sampleUser, ...updatedData };
        UsersRepository.UpdateAsync.mockResolvedValue(updatedUser); // Mock the Update method

        const result = await UsersService.UpdateUserAsync(userId, updatedData);
        expect(result).toEqual(updatedUser); // Assert the updated user is correct
        expect(UsersRepository.UpdateAsync).toHaveBeenCalledWith(userId, updatedData); // Ensure the repository method was called correctly
    });

    test('should delete an user', async () => {
        const userId = sampleUser.id;
        UsersRepository.DeleteAsync.mockResolvedValue(true); // Mock the Delete method

        const result = await UsersService.DeleteUserAsync(userId);
        expect(result).toBe(true); // Assert the result indicates success
        expect(UsersRepository.DeleteAsync).toHaveBeenCalledWith(userId); // Ensure the repository method was called correctly
    });

    test('should list all users', async () => {
        const users = [sampleUser];
        UsersRepository.ListAllAsync.mockResolvedValue(users); // Mock the ListAll method

        const result = await UsersService.ListAllUsersAsync();
        expect(result).toEqual(users); // Assert the returned users match the mock
        expect(UsersRepository.ListAllAsync).toHaveBeenCalled(); // Ensure the repository method was called
    });

    test('should find or create and update user', async () => {
        const attendeeData = {
            email: 'purple@cactus.com',
            name: 'purple cactus'
        };
        
        // Mock the repository methods
        UsersRepository.findOrCreateAndUpdateAsync.mockResolvedValue(sampleUser);
        UsersRepository.findByEmail.mockResolvedValue(sampleUser);

        const result = await UsersService.FindOrCreateAndUpdateUserAsync(attendeeData);
        
        // Verify the result
        expect(result).toEqual(sampleUser);
        
        // Verify the transaction flow
        expect(sequelize.transaction).toHaveBeenCalled();
        expect(UsersRepository.findOrCreateAndUpdateAsync).toHaveBeenCalledWith(attendeeData, mockTransaction);
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
        expect(UsersRepository.findByEmail).toHaveBeenCalledWith(attendeeData.email);
    });

    test('should handle errors in find or create and update user', async () => {
        const attendeeData = {
            email: 'purple@cactus.com',
            name: 'purple cactus'
        };
        
        // Mock the repository method to throw an error
        const error = new Error('Database error');
        UsersRepository.findOrCreateAndUpdateAsync.mockRejectedValue(error);

        // Verify that the error is thrown and transaction is rolled back
        await expect(UsersService.FindOrCreateAndUpdateUserAsync(attendeeData)).rejects.toThrow(error);
        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
});

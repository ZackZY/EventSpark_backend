// tests/UsersRepository.test.js

const Users = require('../db/models').Users; // Assuming your Sequelize index file exports the models
const UsersRepository = require('../repositories/usersRepository');

// Mock the Users model using Jest
jest.mock('../db/models');

describe('UsersRepository', () => {
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

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock history before each test
    });

    test('should create a new user successfully', async () => {
        // Mock the create method of Users model
        Users.create.mockResolvedValue(sampleUser);

        const result = await UsersRepository.CreateAsync(sampleUser);

        // Assertions
        expect(Users.create).toHaveBeenCalledWith(sampleUser);
        expect(result).toEqual(sampleUser);
    });

    test('should find an user by ID', async () => {
        // Mock the findByPk method of Users model
        Users.findByPk.mockResolvedValue(sampleUser);

        const result = await UsersRepository.GetByIdAsync(sampleUser.id);

        // Assertions
        expect(Users.findByPk).toHaveBeenCalledWith(sampleUser.id);
        expect(result).toEqual(sampleUser);
    });

    test('should update an user successfully', async () => {
        const updatedData = { userName: 'Tech Meetup' };
        const updatedUser = { ...sampleUser, ...updatedData };

        // Mock the update method to return an array [numberOfAffectedRows, [updatedUser]]
        Users.update.mockResolvedValue([1, [updatedUser]]);

        const result = await UsersRepository.UpdateAsync(sampleUser.id, updatedData);

        // Assertions
        expect(Users.update).toHaveBeenCalledWith(updatedData, {
            where: { id: sampleUser.id },
            returning: true,
        });
        expect(result).toEqual(updatedUser);
    });

    test('should delete an user by ID successfully', async () => {
        // Mock the destroy method to return 1, indicating one row deleted
        Users.destroy.mockResolvedValue(1);

        const result = await UsersRepository.DeleteAsync(sampleUser.id);

        // Assertions
        expect(Users.destroy).toHaveBeenCalledWith({ where: { id: sampleUser.id } });
        expect(result).toBe(true);
    });

    test('should list all users', async () => {
        const usersList = [sampleUser]; // Array of users to be returned

        // Mock the findAll method to return an array of users
        Users.findAll.mockResolvedValue(usersList);

        const result = await UsersRepository.ListAllAsync();

        // Assertions
        expect(Users.findAll).toHaveBeenCalled();
        expect(result).toEqual(usersList);
    });

    test('should find an user by EMAIL', async () => {
        // Mock the findByPk method of Users model
        Users.findOne.mockResolvedValue(sampleUser);

        const result = await UsersRepository.findByEmail(sampleUser.attendeeEmail);

        // Assertions
        expect(Users.findOne).toHaveBeenCalledWith(sampleUser.attendeeEmail);
        expect(result).toEqual(sampleUser);
    });
});

// tests/UsersRepository.test.js

const Users = require("../db/models").Users; // Assuming your Sequelize index file exports the models
const UsersRepository = require("../repositories/usersRepository");
const sequelize = require('../db/models/index').sequelize;
const Events = require("../db/models").Events;
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

describe("UsersRepository", () => {
  // Sample data for testing
  const sampleUser = {
    id: "1e8b7c18-e96f-4a8d-9e15-0f5e45e3481f",
    name: "purple cactus",
    email: "purple@cactus.com",
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
    jest.clearAllMocks(); // Clear mock history before each test
  });

  test("should create a new user successfully", async () => {
    // Mock the create method of Users model
    Users.create.mockResolvedValue(sampleUser);

    const result = await UsersRepository.CreateAsync(sampleUser);

    // Assertions
    expect(Users.create).toHaveBeenCalledWith(sampleUser);
    expect(result).toEqual(sampleUser);
  });

  test("should find an user by ID", async () => {
    // Mock the findByPk method of Users model
    Users.findByPk.mockResolvedValue(sampleUser);

    const result = await UsersRepository.GetByIdAsync(sampleUser.id);

    // Assertions
    expect(Users.findByPk).toHaveBeenCalledWith(sampleUser.id);
    expect(result).toEqual(sampleUser);
  });

  test("should update an user successfully", async () => {
    const updatedData = { name: "Tech Meetup" };
    const updatedUser = { ...sampleUser, ...updatedData };

    // Mock the update method to return an array [numberOfAffectedRows]
    Users.update.mockResolvedValue([1]);
    Users.findOne.mockResolvedValue(updatedUser);

    const result = await UsersRepository.UpdateAsync(
      sampleUser.id,
      updatedData,
      mockTransaction
    );

    // Assertions
    expect(Users.update).toHaveBeenCalledWith(updatedData, {
      where: { id: sampleUser.id },
    }, {transaction: mockTransaction});
    expect(result).toEqual(updatedUser);
  });

  test("should delete an user by ID successfully", async () => {
    // Mock the destroy method to return 1, indicating one row deleted
    Users.destroy.mockResolvedValue(1);

    const result = await UsersRepository.DeleteAsync(sampleUser.id);

    // Assertions
    expect(Users.destroy).toHaveBeenCalledWith({
      where: { id: sampleUser.id },
    });
    expect(result).toBe(true);
  });

  test("should list all users", async () => {
    const usersList = [sampleUser]; // Array of users to be returned

    // Mock the findAll method to return an array of users
    Users.findAll.mockResolvedValue(usersList);

    const result = await UsersRepository.ListAllAsync();

    // Assertions
    expect(Users.findAll).toHaveBeenCalled();
    expect(result).toEqual(usersList);
  });

  test("should find an user by EMAIL", async () => {
    // Define sample data for the test
    const email = "purple@cactus.com";

    // Mock findOne to return the sample user
    Users.findOne.mockResolvedValue(sampleUser);

    // Call the method
    const result = await UsersRepository.findByEmail(email);

    // Assertions
    expect(Users.findOne).toHaveBeenCalledWith({ where: { email } });
    expect(result).toEqual(sampleUser);
    expect(result.email).toBe(email);
  });

  test("findOrCreateByEmail should return the existing user if a user with the given email already exists", async () => {
    // Sample input and expected output data
    const attendeeData = {
      email: "existing@example.com",
      name: "Existing User",
    };
    const existingUser = [
      { id: "user-uuid", email: attendeeData.email, name: attendeeData.name },
      false,
    ];

    // Mock findOrCreate to simulate finding an existing user
    Users.findOrCreate.mockResolvedValue(existingUser);

    // Call the method
    const result = await UsersRepository.findOrCreateByEmail(
      attendeeData,
      mockTransaction
    );

    // Assertions
    expect(Users.findOrCreate).toHaveBeenCalledWith({
      where: { email: attendeeData.email },
      defaults: { 
        name: attendeeData.name,
        contactNumber: null
      },
      transaction: mockTransaction,
    });
    expect(result).toEqual(existingUser);
    expect(result[1]).toBe(false);
  });

  test("findOrCreateByEmail should create a new user if no user with the given email exists", async () => {
    const attendeeData = { email: "new@example.com", name: "New User"
     };
    const newUser = [
      {
        id: "new-user-uuid",
        email: attendeeData.email,
        name: attendeeData.name,
      },
      true,
    ];

    // Mock findOrCreate to simulate creating a new user
    Users.findOrCreate.mockResolvedValue(newUser);

    // Call the method
    const result = await UsersRepository.findOrCreateByEmail(
      attendeeData,
      mockTransaction
    );

    // Assertions
    expect(Users.findOrCreate).toHaveBeenCalledWith({
      where: { email: attendeeData.email },
      defaults: { name: attendeeData.name, contactNumber: null },
      transaction: mockTransaction,
    });
    expect(result).toEqual(newUser);
    expect(result[1]).toBe(true);
  });

  test("should get user with associated events", async () => {
    const userWithEvents = {
      ...sampleUser,
      Events: [
        {
          id: "event-1",
          name: "Sample Event",
          // ... other event properties
        }
      ]
    };

    Users.findByPk.mockResolvedValue(userWithEvents);

    const result = await UsersRepository.GetEventByUserIdAsync(sampleUser.id);

    expect(Users.findByPk).toHaveBeenCalledWith(sampleUser.id, {
      include: Events
    });
    expect(result).toEqual(userWithEvents);
  });

  test("findOrCreateAndUpdateAsync should update existing user", async () => {
    const userData = {
      email: "purple@cactus.com",
      name: "Updated Purple Cactus"
    };

    // Setup the sequence of mock returns
    Users.findOne
      .mockResolvedValueOnce(sampleUser)  // First call returns original user
      .mockResolvedValueOnce({ ...sampleUser, name: userData.name });  // Second call returns updated user
    
    Users.update.mockResolvedValue([1]);

    const result = await UsersRepository.findOrCreateAndUpdateAsync(userData, mockTransaction);

    expect(Users.findOne).toHaveBeenCalledWith({ where: { email: userData.email }});
    expect(Users.update).toHaveBeenCalled();
    expect(result).toEqual({ ...sampleUser, name: userData.name });
  });

  test("findOrCreateAndUpdateAsync should create new user when user doesn't exist", async () => {
    const userData = {
      email: "new@example.com",
      name: "New User"
    };

    // First findOne returns null (user doesn't exist)
    Users.findOne.mockResolvedValue(null);
    
    const newUser = [
      {
        id: "new-user-uuid",
        ...userData
      },
      true
    ];
    Users.findOrCreate.mockResolvedValue(newUser);

    const result = await UsersRepository.findOrCreateAndUpdateAsync(userData, mockTransaction);

    expect(Users.findOne).toHaveBeenCalledWith({ where: { email: userData.email }});
    expect(Users.findOrCreate).toHaveBeenCalled();
    expect(result).toEqual(newUser);
  });

  test("should handle errors during update", async () => {
    const updatedData = { name: "Tech Meetup" };
    const error = new Error("Database error");

    Users.update.mockRejectedValue(error);

    await expect(UsersRepository.UpdateAsync(
      sampleUser.id,
      updatedData,
      mockTransaction
    )).rejects.toThrow("Database error");
  });

  test("should return null when no user is found to update", async () => {
    const updatedData = { name: "Tech Meetup" };

    Users.update.mockResolvedValue([0]); // 0 rows updated

    const result = await UsersRepository.UpdateAsync(
      sampleUser.id,
      updatedData,
      mockTransaction
    );

    expect(result).toBeNull();
  });
});

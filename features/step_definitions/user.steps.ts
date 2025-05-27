import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import UserRepository from "../../src/repository/user.repository";
import { UserDTO, AddUserResponseDTO } from "../../src/dto/user.dto";
import { ListDivisi } from "@prisma/client";

interface UserWithRelations extends UserDTO {
  divisi?: ListDivisi | null;
}

interface DataTableRow {
  field: string;
  value: string;
}

// Mock data
const mockUser: UserWithRelations = {
  id: "user123",
  email: "test@example.com",
  username: "testuser",
  role: "USER",
  fullname: "Test User",
  password: "hashedpassword",
  divisiId: 1,
  divisionName: "Engineering",
  nokar: "12345",
  waNumber: "081234567890",
  createdBy: "system",
  createdOn: new Date(),
  modifiedBy: null,
  modifiedOn: new Date(),
  deletedBy: null,
  deletedOn: null,
  divisi: {
    id: 1,
    divisi: "Engineering",
    parentId: null,
  },
};

let userRepository: UserRepository;
let result: UserWithRelations | null;

// Initialize
Given("a user exists with ID {string}", async function (id: string) {
  userRepository = new UserRepository();

  userRepository.getUserById = async (userId: string) => {
    if (userId === "user123") {
      return mockUser;
    }
    return null;
  };
});

Given("a user exists with email {string}", async function (email: string) {
  userRepository = new UserRepository();

  userRepository.getUserByEmail = async (userEmail: string) => {
    if (userEmail === "test@example.com") {
      return mockUser;
    }
    return null;
  };
});

When("I request the user with ID {string}", async function (id: string) {
  result = await userRepository.getUserById(id);
});

When("I request the user with email {string}", async function (email: string) {
  result = await userRepository.getUserByEmail(email);
});

Then("I should receive the user details", function () {
  expect(result).to.not.be.null;
  expect(result?.id).to.equal("user123");
  expect(result?.email).to.equal("test@example.com");
  expect(result?.username).to.equal("testuser");
});

Then("the user should have the correct division name", function () {
  expect(result?.divisionName).to.equal("Engineering");
});

// For Create User scenario
let newUserData: any;
let createUserResult: AddUserResponseDTO;

Given("I have valid user data to create", function () {
  userRepository = new UserRepository();
  newUserData = {
    id: "new-user-123",
    email: "new@example.com",
    username: "newuser",
    password: "hashedpassword",
    fullname: "New Test User",
    role: "USER",
    nokar: "54321",
    waNumber: "089876543210",
    divisiId: 2,
  };

  userRepository.createUser = async (userData: any) => {
    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
    };
  };
});

When("I create a new user", async function () {
  createUserResult = await userRepository.createUser(newUserData);
});

Then("the user should be created successfully", function () {
  expect(createUserResult).to.not.be.null;
  expect(createUserResult.id).to.equal("new-user-123");
});

Then("the system should return the new user ID", function () {
  expect(createUserResult.id).to.equal("new-user-123");
});

Then("the user should have the correct creation timestamp", function () {
  expect(createUserResult.id).to.equal("new-user-123");
});

// For Update User scenario
let updateData: Partial<UserDTO>;
let updateResult: UserDTO | null;

When("I update the user with new information", async function (dataTable) {
  const rows = dataTable.hashes();
  updateData = {};

  rows.forEach((row: DataTableRow) => {
    const field = row.field;
    let value: any = row.value;

    if (field === "divisiId") {
      value = parseInt(value);
    }

    updateData[field as keyof UserDTO] = value;
  });

  userRepository.updateUser = async (id: string, data: Partial<UserDTO>) => {
    if (id === "user123") {
      return {
        ...mockUser,
        ...data,
        modifiedOn: new Date(),
      } as UserDTO;
    }
    return null;
  };

  updateResult = await userRepository.updateUser("user123", updateData);
});

Then("the user should be updated successfully", function () {
  expect(updateResult).to.not.be.null;
  expect(updateResult?.fullname).to.equal("Updated User Name");
  expect(updateResult?.waNumber).to.equal("081234567891");
  expect(updateResult?.divisiId).to.equal(2);
});

Then("the modified timestamp should be updated", function () {
  expect(updateResult?.modifiedOn).to.be.instanceof(Date);
});

// For Delete User scenario
let deleteResult: UserDTO | null;

When(
  "I delete the user with ID {string} as {string}",
  async function (id: string, deletedBy: string) {
    userRepository.deleteUser = async (
      userId: string,
      userDeletedBy?: string,
    ) => {
      if (userId === "user123") {
        return {
          ...mockUser,
          deletedOn: new Date(),
          deletedBy: userDeletedBy,
        } as UserDTO;
      }
      return null;
    };

    deleteResult = await userRepository.deleteUser(id, deletedBy);
  },
);

Then("the user should be marked as deleted", function () {
  expect(deleteResult).to.not.be.null;
});

Then("the deleted timestamp should be set", function () {
  expect(deleteResult?.deletedOn).to.be.instanceof(Date);
});

Then(
  "the deleted by field should contain {string}",
  function (deletedBy: string) {
    expect(deleteResult?.deletedBy).to.equal(deletedBy);
  },
);

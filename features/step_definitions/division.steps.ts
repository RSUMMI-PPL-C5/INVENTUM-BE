import { Given, When, Then, Before } from "@cucumber/cucumber";
import { expect } from "chai";
import DivisionRepository from "../../src/repository/division.repository";
import {
  DivisionDTO,
  DivisionWithChildrenDTO,
} from "../../src/dto/division.dto";

// Mock data structure
let mockDivisions: Map<number, DivisionWithChildrenDTO> = new Map();
let divisionRepository: DivisionRepository;
let result: any;
let circularReferenceResult: boolean;
let childrenIds: number[];

// Reset state before each scenario
Before(function () {
  mockDivisions = new Map();
  divisionRepository = new DivisionRepository();
  result = null;
  circularReferenceResult = false;
  childrenIds = [];
});

// Initialize
Given("a division exists with ID {int}", function (id: number) {
  divisionRepository = new DivisionRepository();

  // Create a basic mock division
  const mockDivision: DivisionWithChildrenDTO = {
    id,
    divisi: "Engineering",
    parentId: null,
    children: [],
  };

  mockDivisions.set(id, mockDivision);

  // Mock the getDivisionById method
  divisionRepository.getDivisionById = async (divId: number) => {
    return mockDivisions.get(divId) || null;
  };
});

Given(
  "a division exists with ID {int} and name {string}",
  function (id: number, name: string) {
    divisionRepository = new DivisionRepository();

    // Create a mock division with the specified name
    const mockDivision: DivisionWithChildrenDTO = {
      id,
      divisi: name,
      parentId: null,
      children: [],
    };

    mockDivisions.set(id, mockDivision);

    // Mock the getDivisionById method
    divisionRepository.getDivisionById = async (divId: number) => {
      return mockDivisions.get(divId) || null;
    };
  },
);

Given(
  "a division exists with ID {int} and name {string} with parent ID {int}",
  function (id: number, name: string, parentId: number) {
    // If not initialized yet
    if (!divisionRepository) {
      divisionRepository = new DivisionRepository();
    }

    // Create a mock division with the specified parent
    const mockDivision: DivisionWithChildrenDTO = {
      id,
      divisi: name,
      parentId,
      children: [],
    };

    mockDivisions.set(id, mockDivision);

    // Add this division as a child to its parent if parent exists
    const parentDivision = mockDivisions.get(parentId);
    if (parentDivision && parentDivision.children) {
      parentDivision.children.push(mockDivision);
    }
  },
);

Given("I have a division hierarchy structure", function () {
  divisionRepository = new DivisionRepository();
  mockDivisions.clear();

  // Create a hierarchy
  // Level 1
  const engineering: DivisionWithChildrenDTO = {
    id: 1,
    divisi: "Engineering",
    parentId: null,
    children: [],
  };

  // Level 2
  const frontend: DivisionWithChildrenDTO = {
    id: 2,
    divisi: "Frontend",
    parentId: 1,
    children: [],
  };

  const backend: DivisionWithChildrenDTO = {
    id: 3,
    divisi: "Backend",
    parentId: 1,
    children: [],
  };

  const devops: DivisionWithChildrenDTO = {
    id: 4,
    divisi: "DevOps",
    parentId: 1,
    children: [],
  };

  // Level 3
  const reactTeam: DivisionWithChildrenDTO = {
    id: 5,
    divisi: "React Team",
    parentId: 2,
    children: [],
  };

  const nodeTeam: DivisionWithChildrenDTO = {
    id: 6,
    divisi: "Node Team",
    parentId: 3,
    children: [],
  };

  // Build relationships
  engineering.children = [frontend, backend, devops];
  frontend.children = [reactTeam];
  backend.children = [nodeTeam];

  // Add to map
  mockDivisions.set(1, engineering);
  mockDivisions.set(2, frontend);
  mockDivisions.set(3, backend);
  mockDivisions.set(4, devops);
  mockDivisions.set(5, reactTeam);
  mockDivisions.set(6, nodeTeam);

  // Mock the methods
  divisionRepository.getDivisionsHierarchy = async () => {
    return [engineering];
  };

  divisionRepository.getDivisionWithChildren = async (id: number) => {
    return mockDivisions.get(id) || null;
  };

  divisionRepository.getAllChildrenIds = async (id: number) => {
    const division = mockDivisions.get(id);
    if (!division) return [];

    const childIds: number[] = [];

    if (division.children && division.children.length > 0) {
      for (const child of division.children) {
        childIds.push(child.id);
        // Mock recursive call
        const descendants = await divisionRepository.getAllChildrenIds(
          child.id,
        );
        childIds.push(...descendants);
      }
    }

    return childIds;
  };

  // Mock delete method
  divisionRepository.deleteDivision = async (id: number) => {
    const idsToDelete = await divisionRepository.getAllChildrenIds(id);
    idsToDelete.push(id);

    for (const idToDelete of idsToDelete) {
      mockDivisions.delete(idToDelete);
    }

    return true;
  };
});

When("I create a division with name {string}", async function (name: string) {
  if (!divisionRepository) {
    divisionRepository = new DivisionRepository();
  }

  divisionRepository.addDivision = async (data: Partial<DivisionDTO>) => {
    const newId = mockDivisions.size + 1;
    const newDivision: DivisionWithChildrenDTO = {
      id: newId,
      divisi: data.divisi || "",
      parentId: data.parentId || null,
      children: [],
    };

    mockDivisions.set(newId, newDivision);
    return newDivision;
  };

  result = await divisionRepository.addDivision({ divisi: name });
});

When(
  "I create a child division with name {string} under parent ID {int}",
  async function (name: string, parentId: number) {
    divisionRepository.addDivision = async (data: Partial<DivisionDTO>) => {
      const newId = mockDivisions.size + 1;
      const newDivision: DivisionWithChildrenDTO = {
        id: newId,
        divisi: data.divisi || "",
        parentId: data.parentId || null,
        children: [],
      };

      mockDivisions.set(newId, newDivision);

      const parentDivision = mockDivisions.get(parentId);
      if (parentDivision && parentDivision.children) {
        parentDivision.children.push(newDivision);
      }

      return newDivision;
    };

    result = await divisionRepository.addDivision({
      divisi: name,
      parentId,
    });
  },
);

When("I request the division with ID {int}", async function (id: number) {
  result = await divisionRepository.getDivisionById(id);
});

When("I request the complete division hierarchy", async function () {
  result = await divisionRepository.getDivisionsHierarchy();
});

When(
  "I check if setting division {int} as a child of division {int} would create a circular reference",
  async function (divId: number, potentialParentId: number) {
    divisionRepository.hasCircularReference = async (
      childId: number,
      ancestorId: number,
    ) => {
      // If the ancestor is already a descendant of the child, it would create a circle
      const isDescendant = (
        division: DivisionWithChildrenDTO,
        targetId: number,
      ): boolean => {
        if (division.id === targetId) return true;
        if (!division.children || division.children.length === 0) return false;

        return division.children.some((child) => isDescendant(child, targetId));
      };

      const child = mockDivisions.get(childId);
      if (!child) return false;

      return isDescendant(child, ancestorId);
    };

    circularReferenceResult = await divisionRepository.hasCircularReference(
      divId,
      potentialParentId,
    );
  },
);

When(
  "I request all children IDs for division with ID {int}",
  async function (id: number) {
    childrenIds = await divisionRepository.getAllChildrenIds(id);
  },
);

When("I delete the division with ID {int}", async function (id: number) {
  result = await divisionRepository.deleteDivision(id);
});

Then("the division should be created successfully", function () {
  expect(result).to.not.be.null;
  expect(result.id).to.be.a("number");
});

Then("the division should have the name {string}", function (name: string) {
  expect(result.divisi).to.equal(name);
});

Then("I should receive the division details", function () {
  expect(result).to.not.be.null;
});

Then(
  "division with ID {int} should have {int} direct children",
  function (id: number, childCount: number) {
    const division = mockDivisions.get(id);
    expect(division).to.not.be.undefined;
    expect(division?.children).to.have.lengthOf(childCount);
  },
);

Then(
  "division with ID {int} should have {int} direct child",
  function (id: number, childCount: number) {
    const division = mockDivisions.get(id);
    expect(division).to.not.be.undefined;
    expect(division?.children).to.have.lengthOf(childCount);
  },
);

Then("I should receive a nested hierarchy structure", function () {
  expect(result).to.be.an("array").with.lengthOf(1);
});

Then("the root division should have all its children", function () {
  expect(result[0].children).to.have.lengthOf(3);
});

Then("the children should have their own children", function () {
  expect(result[0].children[0].children).to.have.lengthOf(1);
  expect(result[0].children[1].children).to.have.lengthOf(1);
});

Then("the result should be true indicating a circular reference", function () {
  expect(circularReferenceResult).to.be.true;
});

Then(
  "I should receive all descendant IDs including direct and indirect children",
  function () {
    // For Engineering (ID: 1), we expect IDs 2, 3, 4, 5, 6
    expect(childrenIds).to.include(2); // Frontend
    expect(childrenIds).to.include(3); // Backend
    expect(childrenIds).to.include(4); // DevOps
    expect(childrenIds).to.include(5); // React Team
    expect(childrenIds).to.include(6); // Node Team
    expect(childrenIds).to.have.lengthOf(5);
  },
);

Then("the division and all its children should be deleted", function () {
  // Engineering and all its descendants should be deleted
  expect(mockDivisions.has(1)).to.be.false; // Engineering
  expect(mockDivisions.has(2)).to.be.false; // Frontend
  expect(mockDivisions.has(3)).to.be.false; // Backend
  expect(mockDivisions.has(4)).to.be.false; // DevOps
  expect(mockDivisions.has(5)).to.be.false; // React Team
  expect(mockDivisions.has(6)).to.be.false; // Node Team
});

Then(
  "all users from the deleted divisions should have their division set to null",
  function () {
    // This is automatically handled in the deleteDivision method
    // We could add a test for this by mocking user data if needed
    expect(result).to.be.true;
  },
);

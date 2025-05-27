Feature: Division Management
  As an administrator
  I want to manage divisions in a hierarchical structure
  So that I can organize users by department

  # Basic division operations
  Scenario: Create a new division
    When I create a division with name "Engineering"
    Then the division should be created successfully
    And the division should have the name "Engineering"

  Scenario: Get division by ID
    Given a division exists with ID 1
    When I request the division with ID 1
    Then I should receive the division details
    And the division should have the name "Engineering"

  # Hierarchical division operations
  Scenario: Create a hierarchical division structure
    Given a division exists with ID 1 and name "Engineering"
    When I create a child division with name "Frontend" under parent ID 1
    And I create a child division with name "Backend" under parent ID 1
    And I create a child division with name "DevOps" under parent ID 1
    And I create a child division with name "React Team" under parent ID 2
    Then division with ID 1 should have 3 direct children
    And division with ID 2 should have 1 direct child

  Scenario: Get division hierarchy
    Given I have a division hierarchy structure
    When I request the complete division hierarchy
    Then I should receive a nested hierarchy structure
    And the root division should have all its children
    And the children should have their own children

  # Recursive validation scenarios
  Scenario: Prevent circular references in division hierarchy
    Given a division exists with ID 1 and name "Engineering"
    And a division exists with ID 2 and name "Frontend" with parent ID 1
    And a division exists with ID 3 and name "React Team" with parent ID 2
    When I check if setting division 1 as a child of division 3 would create a circular reference
    Then the result should be true indicating a circular reference

  Scenario: Get all children IDs recursively
    Given I have a division hierarchy structure
    When I request all children IDs for division with ID 1
    Then I should receive all descendant IDs including direct and indirect children

  # Delete operation with recursive cleanup
  Scenario: Delete a division with all its children
    Given I have a division hierarchy structure
    When I delete the division with ID 1
    Then the division and all its children should be deleted
    And all users from the deleted divisions should have their division set to null
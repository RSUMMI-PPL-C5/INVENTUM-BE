Feature: User Management
  As an administrator
  I want to manage users
  So that I can control access to the system

  # GET scenarios
  Scenario: Get user by ID
    Given a user exists with ID "user123"
    When I request the user with ID "user123"
    Then I should receive the user details
    And the user should have the correct division name

  Scenario: Get user by email
    Given a user exists with email "test@example.com"
    When I request the user with email "test@example.com"
    Then I should receive the user details

  # Create user scenario
  Scenario: Create a new user
    Given I have valid user data to create
    When I create a new user
    Then the user should be created successfully
    And the system should return the new user ID
    And the user should have the correct creation timestamp

  # Update user scenario
  Scenario: Update an existing user
    Given a user exists with ID "user123"
    When I update the user with new information
      | field     | value             |
      | fullname  | Updated User Name |
      | waNumber  | 081234567891      |
      | divisiId  | 2                 |
    Then the user should be updated successfully
    And the modified timestamp should be updated

  # Delete user scenario
  Scenario: Delete a user
    Given a user exists with ID "user123"
    When I delete the user with ID "user123" as "admin"
    Then the user should be marked as deleted
    And the deleted timestamp should be set
    And the deleted by field should contain "admin"
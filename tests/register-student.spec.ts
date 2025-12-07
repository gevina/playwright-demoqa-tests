import { expect, test } from '../fixtures/test-fixtures';
import { generateStudentData } from '../utils/test-data';

test.describe('Student Registration Form', () => {
  test('Scenario 1: Register student form with all fields successfully', async ({
    studentRegistrationPage,
  }) => {
    // Given the user is on Student Registration Form
    await studentRegistrationPage.goto();

    // When the user input valid data into all fields
    const studentData = generateStudentData();
    await studentRegistrationPage.fillForm(studentData);

    // And the user clicks on Submit button
    await studentRegistrationPage.submit();

    // Then a successful message "Thanks for submitting the form" is shown
    const confirmationMessage = await studentRegistrationPage.getConfirmationMessage();
    expect(confirmationMessage).toBe('Thanks for submitting the form');

    // And all student information is displayed correctly
    const submittedData = await studentRegistrationPage.getSubmittedData();

    expect(submittedData.get('Student Name')).toBe(`${studentData.firstName} ${studentData.lastName}`);
    expect(submittedData.get('Student Email')).toBe(studentData.email);
    expect(submittedData.get('Gender')).toBe(studentData.gender);
    expect(submittedData.get('Mobile')).toBe(studentData.mobile);
    expect(submittedData.get('Hobbies')).toContain('Sports');
    expect(submittedData.get('Address')).toBe(studentData.currentAddress);
    expect(submittedData.get('State and City')).toBe(`${studentData.state} ${studentData.city}`);
  });
});
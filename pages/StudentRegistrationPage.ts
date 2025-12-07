import { Locator, Page } from '@playwright/test';
import { StudentData } from '../utils/test-data';

export class StudentRegistrationPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly mobileInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly subjectsInput: Locator;
  readonly currentAddressInput: Locator;
  readonly stateDropdown: Locator;
  readonly cityDropdown: Locator;
  readonly submitButton: Locator;
  readonly confirmationModal: Locator;
  readonly confirmationMessage: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#userEmail');
    this.mobileInput = page.locator('#userNumber');
    this.dateOfBirthInput = page.locator('#dateOfBirthInput');
    this.subjectsInput = page.locator('#subjectsInput');
    this.currentAddressInput = page.locator('#currentAddress');
    this.stateDropdown = page.locator('#state');
    this.cityDropdown = page.locator('#city');
    this.submitButton = page.locator('#submit');
    this.confirmationModal = page.locator('.modal-content');
    this.confirmationMessage = page.locator('#example-modal-sizes-title-lg');
    this.closeButton = page.locator('#closeLargeModal');
  }

  async goto() {
    console.log('Navigating to Student Registration Form...');
    
    // Try multiple times with different wait strategies
    let retries = 3;
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Attempt ${i + 1}/${retries}`);
        
        // Navigate with extended timeout and domcontentloaded
        await this.page.goto('/automation-practice-form', {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });
        
        // Wait for the form to be visible
        await this.firstNameInput.waitFor({ state: 'visible', timeout: 30000 });
        
        console.log('✓ Page loaded successfully');
        return; // Success!
        
      } catch (error) {
        lastError = error as Error;
        console.log(`⚠ Attempt ${i + 1} failed: ${error}`);
        
        if (i < retries - 1) {
          console.log('Waiting 3 seconds before retry...');
          await this.page.waitForTimeout(3000);
        }
      }
    }
    
    // If all retries failed
    throw new Error(`Failed to load page after ${retries} attempts. Last error: ${lastError?.message}`);
  }

  async fillForm(data: StudentData) {
    console.log('Filling form with student data...');
    
    // Fill basic fields with waits
    await this.firstNameInput.waitFor({ state: 'visible' });
    await this.firstNameInput.fill(data.firstName);
    
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);

    // Select gender
    const genderRadioId = data.gender === 'Male' ? '1' : data.gender === 'Female' ? '2' : '3';
    await this.page.locator(`label[for="gender-radio-${genderRadioId}"]`).click();

    // Fill mobile
    await this.mobileInput.fill(data.mobile);

    // Fill date of birth
    await this.dateOfBirthInput.click();
    await this.page.waitForTimeout(500); // Wait for datepicker to open
    
    await this.page.locator('.react-datepicker__month-select').selectOption(data.dateOfBirth.month);
    await this.page.locator('.react-datepicker__year-select').selectOption(data.dateOfBirth.year);
    
    // Click the day
    const daySelector = `.react-datepicker__day--0${data.dateOfBirth.day.padStart(2, '0')}:not(.react-datepicker__day--outside-month)`;
    await this.page.locator(daySelector).first().click();
    await this.page.waitForTimeout(300);

    // Fill subjects
    for (const subject of data.subjects) {
      await this.subjectsInput.fill(subject);
      await this.page.waitForTimeout(300);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(200);
    }

    // Select hobbies
    for (const hobby of data.hobbies) {
      await this.page.locator(`label:has-text("${hobby}")`).click();
      await this.page.waitForTimeout(200);
    }

    // Fill address
    await this.currentAddressInput.scrollIntoViewIfNeeded();
    await this.currentAddressInput.fill(data.currentAddress);

    // Select state
    await this.stateDropdown.scrollIntoViewIfNeeded();
    await this.stateDropdown.click();
    await this.page.waitForTimeout(500);
    await this.page.locator(`div:has-text("${data.state}")`).last().click();
    await this.page.waitForTimeout(500);

    // Select city
    await this.cityDropdown.click();
    await this.page.waitForTimeout(500);
    await this.page.locator(`div:has-text("${data.city}")`).last().click();
    await this.page.waitForTimeout(300);
    
    console.log('✓ Form filled successfully');
  }

  async submit() {
    console.log('Submitting form...');
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
    console.log('✓ Submit button clicked');
  }

  async getConfirmationMessage(): Promise<string> {
    console.log('Waiting for confirmation modal...');
    await this.confirmationModal.waitFor({ state: 'visible', timeout: 15000 });
    const message = await this.confirmationMessage.textContent() || '';
    console.log(`✓ Confirmation message: "${message}"`);
    return message;
  }

  async getSubmittedData(): Promise<Map<string, string>> {
    console.log('Reading submitted data from modal...');
    const dataMap = new Map<string, string>();
    const rows = await this.page.locator('.modal-body .table tr').all();

    for (const row of rows) {
      const cells = await row.locator('td').all();
      if (cells.length === 2) {
        const label = await cells[0].textContent();
        const value = await cells[1].textContent();
        if (label && value) {
          dataMap.set(label.trim(), value.trim());
        }
      }
    }

    console.log(`✓ Read ${dataMap.size} data fields from modal`);
    return dataMap;
  }

  async closeModal() {
    await this.closeButton.click();
  }
}
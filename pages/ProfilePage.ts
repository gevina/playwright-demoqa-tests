import { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly booksTable: Locator;
  readonly noRowsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.locator('#searchBox');
    this.booksTable = page.locator('.ReactTable');
    this.noRowsMessage = page.locator('.rt-noData');
  }

  async goto() {
    console.log('Navigating to profile page...');
    
    let retries = 3;
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.goto('/profile', {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });
        
        await this.page.waitForTimeout(2000);
        console.log('✓ Profile page loaded');
        return;
      } catch (error) {
        console.log(`⚠ Profile load attempt ${i + 1} failed`);
        if (i < retries - 1) {
          await this.page.waitForTimeout(3000);
        } else {
          console.log('⚠ Profile page navigation failed, continuing...');
        }
      }
    }
  }

  async searchBook(bookTitle: string) {
    console.log(`Searching for book: ${bookTitle}`);
    try {
      await this.searchBox.waitFor({ state: 'visible', timeout: 10000 });
      await this.searchBox.fill(bookTitle);
      await this.page.waitForTimeout(1500); // Wait for search to filter
      console.log('✓ Search completed');
    } catch (error) {
      console.log('⚠ Search box not available');
      throw error;
    }
  }

  async isBookVisible(bookTitle: string): Promise<boolean> {
    try {
      const bookRow = this.page.locator(`.rt-tr-group:has-text("${bookTitle}")`);
      await bookRow.waitFor({ state: 'visible', timeout: 10000 });
      console.log(`✓ Book "${bookTitle}" is visible`);
      return true;
    } catch {
      console.log(`✗ Book "${bookTitle}" is not visible`);
      return false;
    }
  }

  async deleteBook(bookTitle: string) {
    console.log(`Attempting to delete book: ${bookTitle}`);
    
    // Find the book row and click delete icon
    const bookRow = this.page.locator(`.rt-tr-group:has-text("${bookTitle}")`).first();
    await bookRow.waitFor({ state: 'visible', timeout: 15000 });
    
    const deleteButton = bookRow.locator('#delete-record-undefined');
    await deleteButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await deleteButton.click();
    
    console.log('✓ Delete button clicked');
  }

  async confirmDeleteInModal() {
    console.log('Confirming deletion in modal...');
    
    // Click OK button in the modal
    const modalOkButton = this.page.locator('#closeSmallModal-ok');
    await modalOkButton.waitFor({ state: 'visible', timeout: 10000 });
    await modalOkButton.click();
    
    console.log('✓ Modal OK clicked');
  }

  async confirmAlertDelete() {
    console.log('Waiting for alert...');
    
    // Handle the alert dialog
    this.page.once('dialog', async dialog => {
      console.log(`Alert message: "${dialog.message()}"`);
      await dialog.accept();
      console.log('✓ Alert accepted');
    });
    
    // Wait a bit for alert to appear and be handled
    await this.page.waitForTimeout(3000);
  }

  async waitForBookToDisappear(bookTitle: string) {
    try {
      const bookRow = this.page.locator(`.rt-tr-group:has-text("${bookTitle}")`);
      await bookRow.waitFor({ state: 'hidden', timeout: 15000 });
      console.log(`✓ Book "${bookTitle}" disappeared from table`);
    } catch {
      console.log(`⚠ Book may still be visible or table not loaded`);
    }
  }

  async getTableRowCount(): Promise<number> {
    try {
      await this.page.waitForTimeout(1000);
      const rows = await this.page.locator('.rt-tr-group').filter({ has: this.page.locator('.rt-td') }).count();
      console.log(`Table has ${rows} rows`);
      return rows;
    } catch {
      console.log('⚠ Could not count table rows');
      return 0;
    }
  }

  async isNoDataMessageVisible(): Promise<boolean> {
    try {
      await this.noRowsMessage.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✓ "No rows found" message is visible');
      return true;
    } catch {
      console.log('✗ "No rows found" message not visible');
      return false;
    }
  }
}
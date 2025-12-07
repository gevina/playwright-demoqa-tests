import { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#userName');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login');
    this.logoutButton = page.locator('#submit').filter({ hasText: 'Log out' });
  }

  async goto() {
    console.log('Navigating to login page...');
    
    let retries = 3;
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.goto('/login', {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });
        
        await this.usernameInput.waitFor({ state: 'visible', timeout: 20000 });
        console.log('✓ Login page loaded');
        return;
      } catch (error) {
        console.log(`⚠ Load attempt ${i + 1} failed`);
        if (i < retries - 1) {
          await this.page.waitForTimeout(3000);
        } else {
          throw error;
        }
      }
    }
  }

  async login(username: string, password: string) {
    console.log('Logging in...');
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    // Wait for navigation to complete
    await this.page.waitForURL('**/profile', { timeout: 30000 });
    await this.page.waitForTimeout(2000);
    console.log('✓ Logged in successfully');
  }

  async loginWithCookies(userId: string, username: string, token: string, expires: string) {
    console.log('Setting authentication cookies...');
    
    // Set authentication cookies
    await this.page.context().addCookies([
      {
        name: 'userID',
        value: userId,
        domain: 'demoqa.com',
        path: '/',
        expires: Math.floor(new Date(expires).getTime() / 1000),
      },
      {
        name: 'userName',
        value: username,
        domain: 'demoqa.com',
        path: '/',
        expires: Math.floor(new Date(expires).getTime() / 1000),
      },
      {
        name: 'token',
        value: token,
        domain: 'demoqa.com',
        path: '/',
        expires: Math.floor(new Date(expires).getTime() / 1000),
      },
    ]);

    console.log('✓ Cookies set, navigating to profile...');
    
    // Navigate to profile page with retries
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
          console.log('⚠ Profile page failed to load, continuing anyway...');
          // Don't throw - we'll handle this in the test
        }
      }
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.logoutButton.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
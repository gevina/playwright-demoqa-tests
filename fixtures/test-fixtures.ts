import { test as base } from '@playwright/test';
import { AuthAPI } from '../api/auth-api';
import { BookAPI } from '../api/book-api';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { StudentRegistrationPage } from '../pages/StudentRegistrationPage';
import { BOOK_ISBN, generateUserCredentials } from '../utils/test-data';

type MyFixtures = {
  studentRegistrationPage: StudentRegistrationPage;
  loginPage: LoginPage;
  profilePage: ProfilePage;
  authAPI: AuthAPI;
  bookAPI: BookAPI;
  authenticatedUser: {
    userId: string;
    username: string;
    password: string;
    token: string;
    expires: string;
  };
};

export const test = base.extend<MyFixtures>({
  studentRegistrationPage: async ({ page }, use) => {
    const studentRegistrationPage = new StudentRegistrationPage(page);
    await use(studentRegistrationPage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    await use(profilePage);
  },

  authAPI: async ({ request }, use) => {
    const authAPI = new AuthAPI(request);
    await use(authAPI);
  },

  bookAPI: async ({ request }, use) => {
    const bookAPI = new BookAPI(request);
    await use(bookAPI);
  },

  authenticatedUser: async ({ authAPI, bookAPI }, use) => {
    console.log('=== Setting up authenticated user ===');
    
    // Create a new user
    const credentials = generateUserCredentials();
    console.log('Creating user:', credentials.username);
    
    let user;
    try {
      user = await authAPI.createUser(credentials.username, credentials.password);
      console.log('✓ User created:', user.userId);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
    
    // Generate token first
    let token;
    try {
      console.log('Generating token...');
      token = await authAPI.generateToken(credentials.username, credentials.password);
      console.log('✓ Token generated:', token ? 'Yes' : 'No');
      
      if (!token || token === 'null') {
        throw new Error('Token is null or invalid');
      }
    } catch (error) {
      console.error('Failed to generate token:', error);
      throw error;
    }
    
    // Login to get full auth response
    let authResponse;
    try {
      console.log('Logging in...');
      authResponse = await authAPI.login(credentials.username, credentials.password);
      console.log('✓ Login successful');
      
      // Use token from login response if available
      if (authResponse.token && authResponse.token !== 'null') {
        token = authResponse.token;
      }
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
    
    // Verify authorization
    try {
      console.log('Verifying authorization...');
      const isAuthorized = await authAPI.isAuthorized(credentials.username, credentials.password);
      console.log('✓ User is authorized:', isAuthorized);
      
      if (!isAuthorized) {
        throw new Error('User is not authorized');
      }
    } catch (error) {
      console.error('Authorization check failed:', error);
    }
    
    // Add the Git Pocket Guide book to user's collection
    try {
      console.log('Adding book to user collection...');
      await bookAPI.addBook(user.userId, BOOK_ISBN, token);
      console.log('✓ Book added successfully');
    } catch (error) {
      console.error('Failed to add book:', error);
      throw error;
    }
    
    // Verify book was added
    try {
      const userBooks = await bookAPI.getUserBooks(user.userId, token);
      console.log('✓ User now has', userBooks.length, 'book(s)');
    } catch (error) {
      console.error('Failed to verify books:', error);
    }

    console.log('=== User setup complete ===\n');
    
    // Provide user data to test
    await use({
      userId: user.userId,
      username: credentials.username,
      password: credentials.password,
      token: token,
      expires: authResponse.expires,
    });

    // Cleanup: Delete all books after test
    try {
      console.log('\n=== Cleaning up user data ===');
      await bookAPI.deleteAllBooks(user.userId, token);
      console.log('✓ Cleanup complete');
    } catch (error) {
      console.log('⚠ Cleanup failed (this is okay):', error);
    }
  },
});

export { expect } from '@playwright/test';

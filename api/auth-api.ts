import { APIRequestContext } from '@playwright/test';

export interface AuthResponse {
  userId: string;
  username: string;
  token: string;
  expires: string;
  created_date: string;
  isActive: boolean;
}

export class AuthAPI {
  private request: APIRequestContext;
  private baseURL: string;

  constructor(request: APIRequestContext, baseURL: string = 'https://demoqa.com') {
    this.request = request;
    this.baseURL = baseURL;
  }

  async createUser(username: string, password: string): Promise<{ userId: string; username: string }> {
    console.log('Creating user via API...');
    
    const response = await this.request.post(`${this.baseURL}/Account/v1/User`, {
      data: {
        userName: username,
        password: password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`Failed to create user: ${response.status()} - ${errorBody}`);
    }

    const body = await response.json();
    console.log('✓ User created:', body.userID);
    
    return {
      userId: body.userID,
      username: body.username,
    };
  }

  async generateToken(username: string, password: string): Promise<string> {
    console.log('Generating token via API...');
    
    const response = await this.request.post(`${this.baseURL}/Account/v1/GenerateToken`, {
      data: {
        userName: username,
        password: password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`Failed to generate token: ${response.status()} - ${errorBody}`);
    }

    const body = await response.json();
    
    if (body.status === 'Failed' || !body.token || body.token === 'null') {
      throw new Error(`Token generation failed: ${body.result || 'Unknown error'}`);
    }
    
    console.log('✓ Token generated successfully');
    return body.token;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    console.log('Logging in via API...');
    
    const response = await this.request.post(`${this.baseURL}/Account/v1/Login`, {
      data: {
        userName: username,
        password: password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`Failed to login: ${response.status()} - ${errorBody}`);
    }

    const body = await response.json();
    console.log('✓ Login successful');
    
    return body;
  }

  async isAuthorized(username: string, password: string): Promise<boolean> {
    const response = await this.request.post(`${this.baseURL}/Account/v1/Authorized`, {
      data: {
        userName: username,
        password: password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      return false;
    }

    const body = await response.json();
    return body === true || body === 'true';
  }
}
import { APIRequestContext } from '@playwright/test';

export interface Book {
  isbn: string;
  title: string;
  subTitle: string;
  author: string;
  publish_date: string;
  publisher: string;
  pages: number;
  description: string;
  website: string;
}

export interface AddBooksRequest {
  userId: string;
  collectionOfIsbns: { isbn: string }[];
}

export class BookAPI {
  private request: APIRequestContext;
  private baseURL: string;

  constructor(request: APIRequestContext, baseURL: string = 'https://demoqa.com') {
    this.request = request;
    this.baseURL = baseURL;
  }

  async getBooks(): Promise<Book[]> {
    const response = await this.request.get(`${this.baseURL}/BookStore/v1/Books`);
    
    if (!response.ok()) {
      throw new Error(`Failed to get books: ${response.status()}`);
    }

    const body = await response.json();
    return body.books;
  }

  async addBook(userId: string, isbn: string, token: string): Promise<void> {
    console.log('Adding book via API...');
    console.log('UserId:', userId);
    console.log('ISBN:', isbn);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    const response = await this.request.post(`${this.baseURL}/BookStore/v1/Books`, {
      data: {
        userId: userId,
        collectionOfIsbns: [{ isbn: isbn }],
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      console.error('Add book failed:', response.status(), errorBody);
      throw new Error(`Failed to add book: ${response.status()} - ${errorBody}`);
    }
    
    console.log('✓ Book added successfully');
  }

  async deleteBook(userId: string, isbn: string, token: string): Promise<void> {
    console.log('Deleting book via API...');
    
    const response = await this.request.delete(`${this.baseURL}/BookStore/v1/Book`, {
      data: {
        isbn: isbn,
        userId: userId,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      console.error('Delete book failed:', response.status(), errorBody);
      throw new Error(`Failed to delete book: ${response.status()} - ${errorBody}`);
    }
    
    console.log('✓ Book deleted successfully');
  }

  async deleteAllBooks(userId: string, token: string): Promise<void> {
    console.log('Deleting all books via API...');
    
    const response = await this.request.delete(`${this.baseURL}/BookStore/v1/Books?UserId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      console.error('Delete all books failed:', response.status(), errorBody);
      throw new Error(`Failed to delete all books: ${response.status()} - ${errorBody}`);
    }
    
    console.log('✓ All books deleted successfully');
  }

  async getUserBooks(userId: string, token: string): Promise<Book[]> {
    console.log('Getting user books via API...');
    
    const response = await this.request.get(`${this.baseURL}/Account/v1/User/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      console.error('Get user books failed:', response.status(), errorBody);
      throw new Error(`Failed to get user books: ${response.status()} - ${errorBody}`);
    }

    const body = await response.json();
    console.log(`✓ User has ${body.books?.length || 0} books`);
    return body.books || [];
  }
}
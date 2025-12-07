import { faker } from '@faker-js/faker';

export interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  subjects: string[];
  hobbies: string[];
  picture?: string;
  currentAddress: string;
  state: string;
  city: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export function generateStudentData(): StudentData {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
    mobile: faker.string.numeric(10),
    dateOfBirth: {
      day: faker.number.int({ min: 1, max: 28 }).toString(),
      month: faker.date.month(),
      year: faker.number.int({ min: 1990, max: 2005 }).toString(),
    },
    subjects: ['Maths', 'English'],
    hobbies: ['Sports', 'Reading'],
    currentAddress: faker.location.streetAddress(),
    state: 'NCR',
    city: 'Delhi',
  };
}

export function generateUserCredentials(): UserCredentials {
  const timestamp = Date.now();
  return {
    username: `testuser_${timestamp}`,
    password: 'Test@123456',
  };
}

export const BOOK_ISBN = '9781449325862';
export const BOOK_TITLE = 'Git Pocket Guide';
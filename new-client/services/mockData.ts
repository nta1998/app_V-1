// Mock data matching the real Django API schema.
// Used only for development/testing when the server is unavailable.
import type { Project, Apartment } from './api';

export const mockUser = {
  id: 'mock-uuid-1',
  email: 'yosef@example.com',
  full_name: 'יוסף כהן',
  phone_number: null,
  avatar: null,
  is_staff: false,
  is_active: true,
};

const mockProjectBase: Omit<Project, 'id' | 'project_address' | 'title'> = {
  project_url: null,
  project_image_url: null,
  project_description: null,
  percentage: 50,
  type: 'תמ"א',
  documents: [],
};

export const mockProjects: Project[] = [
  {
    ...mockProjectBase,
    id: 1,
    project_address: 'תל אביב, רחוב הירקון 10',
    title: 'פרויקט הירקון',
    project_description:
      'פרויקט יוקרה מרכזי בלב תל אביב, הכולל 48 יחידות דיור מפוארות עם נוף פנורמי לנהר הירקון.',
    percentage: 75,
    type: 'תמ"א 38',
  },
  {
    ...mockProjectBase,
    id: 2,
    project_address: 'חיפה, שדרות הנשיא 5',
    title: 'מגדל הים',
    project_description: 'מגדל יוקרה עם נוף לים התיכון.',
    percentage: 40,
  },
  {
    ...mockProjectBase,
    id: 3,
    project_address: 'ירושלים, רחוב יפו 120',
    title: 'שכונת הגנים',
    project_description: 'פרויקט ירוק בלב העיר.',
    percentage: 20,
  },
];

const mockProjectFull = mockProjects[0]!;

export const mockApartments: Apartment[] = [
  {
    id: 1,
    project: mockProjectFull,
    price: '3200000',
    apartment_specific_address: 'דירת גן A1',
    apartment_size_sqm: 120,
    number_of_rooms: 4,
    floor: 1,
    facade: null,
    balcony_size_sqm: null,
    air_directions: null,
    parking: null,
    neighborhood: null,
    entry_date: null,
    apartment_image_url: null,
    bank_escort: false,
    description: null,
    type: 'תמ"א',
    main_image_doc: null,
    main_image: null,
    documents: [],
  },
  {
    id: 2,
    project: mockProjectFull,
    price: '5500000',
    apartment_specific_address: 'פנטהאוז B3',
    apartment_size_sqm: 180,
    number_of_rooms: 5,
    floor: 10,
    facade: null,
    balcony_size_sqm: 30,
    air_directions: null,
    parking: '2 מקומות',
    neighborhood: null,
    entry_date: null,
    apartment_image_url: null,
    bank_escort: false,
    description: null,
    type: 'תמ"א',
    main_image_doc: null,
    main_image: null,
    documents: [],
  },
];

export const mockStats = {
  totalInvestment: '₪2.4M',
  annualReturn: '8.4%',
  activeDeals: 3,
};

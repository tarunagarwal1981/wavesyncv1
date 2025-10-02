import { faker } from '@faker-js/faker'
import type {
  Certificate,
  Assignment,
  Circular,
  Ticket,
  SignoffChecklistItem,
  Notification,
  UpcomingItem,
  DashboardStats,
  DashboardData,
} from '@/types/dashboard'

// Mock user profile
export const mockUser = {
  id: faker.string.uuid(),
  email: faker.internet.email(),
  profiles: {
    employee_id: `EMP-${faker.string.alphanumeric(8).toUpperCase()}`,
    rank: faker.helpers.arrayElement(['Captain', 'Chief Officer', 'Second Officer', 'Third Officer', 'Chief Engineer', 'Second Engineer']),
    full_name: faker.person.fullName(),
    nationality: faker.location.country(),
    phone: faker.phone.number(),
    avatar_url: faker.image.avatar(),
  },
}

// Mock certificates
export const mockCertificate = (overrides?: Partial<Certificate>): Certificate => ({
  id: faker.string.uuid(),
  user_id: mockUser.id,
  certificate_type: faker.helpers.arrayElement(['COC', 'COP', 'GOC', 'PSC', 'STCW']),
  certificate_name: `Certificate of ${faker.commerce.department()}`,
  issue_date: faker.date.past({ years: 2 }).toISOString(),
  expiry_date: faker.date.future({ years: 1 }).toISOString(),
  issuing_authority: faker.company.name(),
  certificate_number: faker.string.alphanumeric(10).toUpperCase(),
  document_url: faker.image.url(),
  status: faker.helpers.arrayElement(['valid', 'expired', 'pending_renewal']),
  reminder_sent: faker.datatype.boolean(),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides,
})

export const mockCertificates = (count: number = 5): Certificate[] =>
  Array.from({ length: count }, () => mockCertificate())

export const mockExpiringCertificate = (): Certificate =>
  mockCertificate({
    expiry_date: faker.date.future({ days: 30 }).toISOString(),
    status: 'valid',
  })

export const mockExpiredCertificate = (): Certificate =>
  mockCertificate({
    expiry_date: faker.date.past({ days: 30 }).toISOString(),
    status: 'expired',
  })

// Mock assignments
export const mockAssignment = (overrides?: Partial<Assignment>): Assignment => ({
  id: faker.string.uuid(),
  user_id: mockUser.id,
  vessel_id: faker.string.uuid(),
  join_date: faker.date.past().toISOString(),
  expected_signoff_date: faker.date.future().toISOString(),
  actual_signoff_date: undefined,
  status: faker.helpers.arrayElement(['active', 'completed', 'cancelled']),
  contract_reference: `CON-${faker.string.alphanumeric(8).toUpperCase()}`,
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  vessels: {
    vessel_name: faker.company.name() + ' Vessel',
    vessel_type: faker.helpers.arrayElement(['Container', 'Tanker', 'Bulk Carrier', 'Gas Carrier']),
    imo_number: faker.string.numeric(7),
    flag: faker.location.country(),
  },
  ...overrides,
})

export const mockActiveAssignment = (): Assignment =>
  mockAssignment({
    status: 'active',
    expected_signoff_date: faker.date.future({ months: 1 }).toISOString(),
  })

// Mock circulars
export const mockCircular = (overrides?: Partial<Circular>): Circular => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  reference_number: `CIR-${faker.string.alphanumeric(6).toUpperCase()}`,
  category: faker.helpers.arrayElement(['Safety', 'Navigation', 'Maintenance', 'Administrative']),
  priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
  issue_date: faker.date.recent().toISOString(),
  content: faker.lorem.paragraphs(3),
  attachments: faker.datatype.boolean() ? [faker.image.url()] : [],
  published_by: faker.person.fullName(),
  requires_acknowledgment: faker.datatype.boolean(),
  created_at: faker.date.recent().toISOString(),
  ...overrides,
})

export const mockCirculars = (count: number = 5): Circular[] =>
  Array.from({ length: count }, () => mockCircular())

export const mockUrgentCircular = (): Circular =>
  mockCircular({
    priority: 'urgent',
    requires_acknowledgment: true,
  })

// Mock tickets
export const mockTicket = (overrides?: Partial<Ticket>): Ticket => ({
  id: faker.string.uuid(),
  user_id: mockUser.id,
  assignment_id: faker.string.uuid(),
  ticket_type: faker.helpers.arrayElement(['flight', 'ferry', 'bus', 'train']),
  booking_reference: faker.string.alphanumeric(8).toUpperCase(),
  departure_airport: faker.airport.iataCode(),
  arrival_airport: faker.airport.iataCode(),
  departure_datetime: faker.date.future().toISOString(),
  arrival_datetime: faker.date.future().toISOString(),
  airline: faker.company.name(),
  flight_number: faker.airline.flightNumber(),
  seat_number: faker.string.alphanumeric(3),
  document_url: faker.image.url(),
  created_at: faker.date.recent().toISOString(),
  ...overrides,
})

export const mockUpcomingTicket = (): Ticket =>
  mockTicket({
    departure_datetime: faker.date.future({ days: 7 }).toISOString(),
    arrival_datetime: faker.date.future({ days: 7 }).toISOString(),
  })

// Mock signoff checklist items
export const mockSignoffChecklistItem = (overrides?: Partial<SignoffChecklistItem>): SignoffChecklistItem => ({
  id: faker.string.uuid(),
  user_id: mockUser.id,
  assignment_id: faker.string.uuid(),
  item_text: faker.lorem.sentence(),
  category: faker.helpers.arrayElement(['Safety', 'Navigation', 'Documentation', 'Maintenance']),
  is_completed: faker.datatype.boolean(),
  completed_at: faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined,
  notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
  created_at: faker.date.recent().toISOString(),
  ...overrides,
})

export const mockSignoffChecklistItems = (count: number = 10): SignoffChecklistItem[] =>
  Array.from({ length: count }, () => mockSignoffChecklistItem())

// Mock notifications
export const mockNotification = (overrides?: Partial<Notification>): Notification => ({
  id: faker.string.uuid(),
  user_id: mockUser.id,
  type: faker.helpers.arrayElement(['info', 'success', 'warning', 'error']),
  title: faker.lorem.sentence(),
  message: faker.lorem.paragraph(),
  link: faker.datatype.boolean() ? faker.url.pathname() : undefined,
  is_read: faker.datatype.boolean(),
  created_at: faker.date.recent().toISOString(),
  ...overrides,
})

export const mockNotifications = (count: number = 5): Notification[] =>
  Array.from({ length: count }, () => mockNotification())

// Mock upcoming items
export const mockUpcomingItem = (overrides?: Partial<UpcomingItem>): UpcomingItem => ({
  id: faker.string.uuid(),
  type: faker.helpers.arrayElement(['certificate_expiry', 'travel', 'signoff', 'assignment_reminder']),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  date: faker.date.future(),
  priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
  link: faker.url.pathname(),
  ...overrides,
})

export const mockUpcomingItems = (count: number = 5): UpcomingItem[] =>
  Array.from({ length: count }, () => mockUpcomingItem())

// Mock dashboard stats
export const mockDashboardStats = (): DashboardStats => ({
  pendingTasks: faker.number.int({ min: 0, max: 10 }),
  expiringCertificates: faker.number.int({ min: 0, max: 5 }),
  unreadCirculars: faker.number.int({ min: 0, max: 15 }),
  upcomingTravel: faker.datatype.boolean() ? faker.date.future({ days: 30 }) : undefined,
})

// Mock dashboard data
export const mockDashboardData = (overrides?: Partial<DashboardData>): DashboardData => ({
  user: mockUser,
  activeAssignment: faker.datatype.boolean() ? mockActiveAssignment() : undefined,
  stats: mockDashboardStats(),
  upcomingItems: mockUpcomingItems(5),
  recentCirculars: mockCirculars(5).map(circular => ({
    ...circular,
    is_read: faker.datatype.boolean(),
  })),
  recentCertificates: mockCertificates(3),
  recentTickets: mockUpcomingTicket() ? [mockUpcomingTicket()] : [],
  ...overrides,
})

// Helper to create mock API responses
export const mockApiResponse = <T>(data: T) => ({
  data,
  error: null,
  status: 200,
  statusText: 'OK',
})

export const mockApiError = (message: string, status: number = 400) => ({
  data: null,
  error: { message },
  status,
  statusText: 'Bad Request',
})

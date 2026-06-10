import { z } from 'zod'

export const WorkshopStatusEnum = z.enum(['DRAFT', 'OPEN', 'CLOSED', 'CANCELLED'])
export const AllocationModeEnum = z.enum(['FCFS', 'INTEREST_RANKING', 'RANDOM', 'MANUAL'])

export type WorkshopStatus = z.infer<typeof WorkshopStatusEnum>
export type AllocationMode = z.infer<typeof AllocationModeEnum>

export const workshopSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  event: z.string().min(1, 'Event is required'),
  date: z.string().min(1, 'Date is required'),
  venue: z.string().nullable().optional(),
  room: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
  what_to_expect: z.string().nullable().optional(),
  what_to_bring: z.string().nullable().optional(),
  status: WorkshopStatusEnum.optional().default('DRAFT'),
  allocation_mode: AllocationModeEnum.optional().default('FCFS'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').nullable().optional(),
  duration_minutes: z.number().int().min(1, 'Duration must be at least 1 minute').nullable().optional(),
  registration_opens_at: z.string().nullable().optional(),
  registration_closes_at: z.string().nullable().optional(),
})

export type WorkshopFormData = z.infer<typeof workshopSchema>

export const defaultWorkshopForm = (): WorkshopFormData => ({
  title: '',
  description: '',
  event: '',
  date: '',
  venue: null,
  room: null,
  notes: null,
  what_to_expect: null,
  what_to_bring: null,
  status: 'DRAFT',
  allocation_mode: 'FCFS',
  capacity: null,
  duration_minutes: null,
  registration_opens_at: null,
  registration_closes_at: null,
})

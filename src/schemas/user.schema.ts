import { z } from 'zod'

/**
 * User Schema for user account validation
 */
export const UserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(150, 'First name must be less than 150 characters')
    .trim(),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(150, 'Last name must be less than 150 characters')
    .trim(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(150, 'Username must be less than 150 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens')
    .optional(),
})

/**
 * User Registration Schema with password validation
 */
export const UserRegistrationSchema = UserSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  password_confirm: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
})

/**
 * Change Password Schema
 */
export const ChangePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    new_password_confirm: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: 'Passwords do not match',
    path: ['new_password_confirm'],
  })
  .refine((data) => data.old_password !== data.new_password, {
    message: 'New password must be different from current password',
    path: ['new_password'],
  })

export type UserFormData = z.infer<typeof UserSchema>
export type UserRegistrationFormData = z.infer<typeof UserRegistrationSchema>
export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>
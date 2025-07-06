import { z } from 'zod';

// Registration schema
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name cannot exceed 255 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character')
});

// Login schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
});

// Profile update schema
export const profileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name cannot exceed 255 characters')
    .optional(),
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
});

// Password change schema
export const passwordChangeSchema = z.object({
  oldPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character')
});

// Note schema
export const noteSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z.string()
    .min(1, 'Description is required'),
  isProtected: z.boolean().optional().default(false),
  password: z.string().optional()
}).refine((data) => {
  // If note is protected, password is required
  return !data.isProtected || (data.isProtected && data.password);
}, {
  message: 'Password is required for protected notes',
  path: ['password']
});

// Note unlock schema
export const unlockSchema = z.object({
  password: z.string()
    .min(1, 'Password is required')
});

// Revert version schema
export const revertSchema = z.object({
  versionId: z.number()
    .int()
    .positive('Version ID must be a positive integer')
}); 
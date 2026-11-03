import { z } from 'zod';

export const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

export const UserRegistrationSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be between 20 and 60 characters')
    .max(60, 'Name must be between 20 and 60 characters'),
  email: z.string().email('Please enter a valid email address').max(255),
  address: z.string().max(400, 'Address cannot exceed 400 characters'),
  password: z
    .string()
    .regex(
      passwordRegex,
      'Password requires 8-16 chars, 1 uppercase, and 1 special symbol'
    )
});

export const AdminUserCreationSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be between 20 and 60 characters')
    .max(60, 'Name must be between 20 and 60 characters'),
  email: z.string().email('Please enter a valid email address').max(255),
  address: z.string().max(400, 'Address cannot exceed 400 characters'),
  password: z
    .string()
    .regex(
      passwordRegex,
      'Password requires 8-16 chars, 1 uppercase, and 1 special symbol'
    ),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER'])
});

export const StoreCreationSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(100),
  email: z.string().email('Invalid store contact email').max(255),
  address: z.string().min(1, 'Store address is required').max(400),
  ownerId: z.string().min(1, 'Valid Owner UUID is required')
});

export const RatingSubmissionSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required'),
  rating: z
    .number()
    .int('Rating must be an integer between 1 and 5')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z
      .string()
      .regex(
        passwordRegex,
        'Password requires 8-16 chars, 1 uppercase, and 1 special symbol'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword']
  });

export type UserRegistrationFormData = z.infer<typeof UserRegistrationSchema>;
export type AdminUserCreationFormData = z.infer<typeof AdminUserCreationSchema>;
export type StoreCreationFormData = z.infer<typeof StoreCreationSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;


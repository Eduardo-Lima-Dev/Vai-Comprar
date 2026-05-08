import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email().toLowerCase(),
  password: z.string().min(6).max(72),
});

export const LoginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(6).max(72),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.email().toLowerCase().optional(),
  password: z.string().min(6).max(72).optional(),
});

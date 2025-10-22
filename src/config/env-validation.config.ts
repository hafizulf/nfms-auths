import { z, ZodError } from 'zod';

export const formatEnvErrors = (error: ZodError) => {
  return error.issues.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
}

export const EnvValidationSchema = z.object({
  APP_PORT: z
    .string()
    .regex(/^\d+$/, { message: 'PORT must be a number' })
    .transform(Number),

  USERS_GRPC_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION_TIME: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRATION_TIME: z.string(),

  EMAIL_REGISTER_URL: z.string(),
  EMAIL_FORGOT_PASSWORD_URL: z.string(),
  RABBITMQ_URI: z.string(),
});

export const EnvValidationOptions = {
  strict: true,
  abortEarly: false,
};

export type Env = z.infer<typeof EnvValidationSchema>;

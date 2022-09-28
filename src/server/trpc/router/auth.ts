import { z } from 'zod';
import { t, authedProcedure } from '../trpc';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';

export const authRouter = t.router({
	register: t.procedure
		.input(
			z
				.object({
					username: z.string().min(5),
					email: z.string().email(),
					password: z
						.string()
						.min(8, 'Password must be at least 8 characters')
						.regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{12,})/, {
							message:
								'Password must at least 12 char long and contain at least 1 uppercase letter, 1 number, and 1 special character',
						}),
					confirmPassword: z.string().min(1, 'Confirm password is required'),
				})
				.refine((data) => data.password === data.confirmPassword, {
					message: 'Passwords do not match',
					path: ['confirmPassword'],
				})
		)
		.mutation(async ({ ctx, input }) => {
			const { username, email, password } = input;

			const user = await ctx.prisma.userSchema.findUnique({
				where: { email: email },
			});

			if (user) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Email already exists',
				});
			}

			const passwordHash = await bcrypt.hash(password, 12);

			const newUser = await ctx.prisma.userSchema.create({
				data: {
					password: passwordHash,
					email,
					username,
				},
				select: {
					id: true,
					username: true,
					email: true,
					createdAt: true,
				},
			});

			return newUser;
		}),
	getSession: t.procedure.query(({ ctx }) => {
		return ctx.session;
	}),
	getSecretMessage: authedProcedure.query(() => {
		return 'You are logged in and can see this secret message!';
	}),
});

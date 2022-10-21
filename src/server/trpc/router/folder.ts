import { z } from 'zod';
import { t } from '../trpc';
import { TRPCError } from '@trpc/server';

export const folderRouter = t.router({
	create: t.procedure
		.input(
			z.object({
				userId: z.string(),
			})
		)
		.mutation(async () => {
			////
		}),
});

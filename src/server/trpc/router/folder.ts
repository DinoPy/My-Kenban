import { boardReturn } from './board';
import { z } from 'zod';
import { t } from '../trpc';

export const folderReturn = {
	id: true,
	name: true,
	userSchemaId: true,
	Board: {
		select: boardReturn,
	},
};

export const folderRouter = t.router({
	create: t.procedure
		.input(
			z.object({
				userId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				// create the folder without the board content
				const folder = await ctx.prisma.folder.create({
					data: {
						userSchemaId: input.userId,

						Board: {
							create: {
								userId: input.userId,
								position: 0,
							},
						},
					},
					select: folderReturn,
				});

				return folder;
			} catch (e) {
				console.log(e);
			}
		}),
});

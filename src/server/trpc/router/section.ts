import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { t } from '../trpc';

const sectionReturn = {
	id: true,
	title: true,
	task: {
		select: {
			id: true,
			title: true,
			content: true,
			position: true,
		},
	},
};

export const sectionRouter = t.router({
	//
	create: t.procedure
		.input(z.object({ boardId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const newSection = await ctx.prisma.section.create({
					data: {
						boardId: input.boardId,
					},
					select: sectionReturn,
				});
				return newSection;
			} catch (e) {
				throw new TRPCError({
					message: (e as Error).message,
					code: 'INTERNAL_SERVER_ERROR',
				});
			}
		}),
	update: t.procedure
		.input(z.object({ id: z.string(), title: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const section = await ctx.prisma.section.update({
					where: {
						id: input.id,
					},
					data: {
						title: input.title,
					},
				});
				return section;
			} catch (e) {
				throw new TRPCError({
					message: (e as Error).message,
					code: 'INTERNAL_SERVER_ERROR',
				});
			}
		}),
	delete: t.procedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const deletedSection = await ctx.prisma.section.delete({
					where: {
						id: input.id,
					},
				});
				return deletedSection;
			} catch (e) {
				throw new TRPCError({
					message: (e as Error).message,
					code: 'INTERNAL_SERVER_ERROR',
				});
			}
		}),
});

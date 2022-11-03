import { TRPCError } from '@trpc/server';
import { z, number } from 'zod';
import { t } from '../trpc';

const sectionReturn = {
	id: true,
	title: true,
	position: true,
	archived: true,
	task: {
		select: {
			id: true,
			title: true,
			content: true,
			position: true,
			createdAt: true,
			archived: true,
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
	positonUpdate: t.procedure
		.input(
			z.array(
				z.object({
					id: z.string(),
					position: z.number(),
				})
			)
		)
		.mutation(async ({ ctx, input }) => {
			////

			for (const index in input) {
				await ctx.prisma.section.update({
					where: {
						id: input[index]?.id,
					},
					data: {
						position: parseInt(index),
					},
				});
			}
			try {
			} catch (e) {
				throw new TRPCError({
					message: JSON.stringify(e),
					code: 'BAD_REQUEST',
				});
			}
		}),

	archiveSection: t.procedure
		.input(z.object({ sectionId: z.string(), archived: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const section = await ctx.prisma.section.update({
					where: {
						id: input.sectionId,
					},
					data: {
						archived: !input.archived,
					},
				});
				return { message: 'success' };
			} catch (e) {
				throw new TRPCError({
					message: JSON.stringify(e),
					code: 'INTERNAL_SERVER_ERROR',
				});
			}
		}),
});

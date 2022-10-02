import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { t } from '../trpc';

const boardReturn = {
	id: true,
	title: true,
	icon: true,
	description: true,
	position: true,
	favorite: true,
	favoritePosition: true,
	createdAt: true,
	userId: true,
};

const sectionReturn = {
	Section: {
		select: {
			id: true,
			title: true,
			task: {
				select: {
					id: true,
					content: true,
					title: true,
					position: true,
				},
			},
		},
	},
};

// TO DO condition the prisma searches to also include userId of the user
// this to avoid random useres making changes to anything but their data

// complete the input from the client once we have more details
export const boardRouter = t.router({
	create: t.procedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const boards = await ctx.prisma.board.count();
			const newBoard = await ctx.prisma.board.create({
				data: {
					userId: input.userId,
					position: boards > 0 ? boards + 1 : 1,
				},
				select: boardReturn,
			});
			return newBoard;
		}),
	getAll: t.procedure
		.input(
			z.object({
				userId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				const boards = await ctx.prisma.board.findMany({
					where: {
						userId: input.userId,
					},
					orderBy: {
						position: 'desc',
					},
					select: boardReturn,
				});
				return boards;
			} catch (e) {
				console.log(e);
			}
		}),
	updatePosition: t.procedure
		.input(
			z.object({
				boards: z.array(
					z.object({
						id: z.string(),
					})
				),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				for (const key in input.boards.reverse()) {
					const board = input.boards[key];
					await ctx.prisma.board.update({
						where: {
							id: board?.id,
						},
						data: {
							position: parseInt(key),
						},
					});
				}

				return { message: 'success' };
			} catch (e) {
				console.log(e);
			}
		}),
	getOne: t.procedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const board = await ctx.prisma.board.findUnique({
				where: {
					id: input.id,
				},
				select: { ...boardReturn, ...sectionReturn },
			});
			return board;
		}),

	update: t.procedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().default('Untitled'),
				icon: z.string().default('⛩'),
				description: z.string().default('Add description here'),
				favorite: z.boolean().default(false),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const board = await ctx.prisma.board.update({
					where: {
						id: input.id,
					},
					data: {
						title: input.title,
						icon: input.icon,
						description: input.description,
						favorite: input.favorite,
					},
					select: boardReturn,
				});
				return board;
			} catch (e) {
				console.log(e);
				return null;
			}
		}),
	updateFavoritePositon: t.procedure
		.input(
			z.object({
				boards: z.array(
					z.object({
						id: z.string(),
					})
				),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				for (const key in input.boards.reverse()) {
					const board = input.boards[key];
					await ctx.prisma.board.update({
						where: {
							id: board?.id,
						},
						data: {
							position: parseInt(key),
						},
					});
				}

				return { message: 'success' };
			} catch (e) {
				console.log(e);
			}
		}),
	deleteBoard: t.procedure
		.input(z.object({ id: z.string(), userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const board = await ctx.prisma.board.findFirst({
					where: { id: input.id, userId: input.userId },
				});

				if (!board) {
					throw new TRPCError({
						message: 'Board not found',
						code: 'NOT_FOUND',
					});
				}

				const deleted = await ctx.prisma.board.delete({
					where: {
						id: input.id,
					},
					select: boardReturn,
				});
				return deleted;
			} catch (e) {
				console.log(e);
				return null;
			}
		}),
});

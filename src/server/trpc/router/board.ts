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
	Section: {
		select: {
			boardId: true,
			title: true,
		},
	},
};

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
		}),
	// updatePosition: t.procedure
	// 	.input(
	// 		z.object({
	// 			boards: z.array({
	// 				title: z.string(),
	// 			}),
	// 		})
	// 	)
	// 	.mutation(async ({ ctx, input }) => {
	// 		try {
	// 			for (const key in input.boards.reverse()) {
	// 				const board = input.boards[key];
	// 				await ctx.prisma.board.update({
	// 					where: {
	// 						id: board.id,
	// 					},
	// 					data: {
	// 						position: key,
	// 					},
	// 				});
	// 			}
	// 		} catch (e) {
	// 			console.log(e);
	// 		}
	// 	}),
});

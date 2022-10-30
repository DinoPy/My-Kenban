import { TRPCError } from '@trpc/server';
import { boardReturn } from './board';
import { z } from 'zod';
import { t } from '../trpc';

export const folderReturn = {
	id: true,
	name: true,
	userSchemaId: true,
	position: true,
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
	editName: t.procedure
		.input(
			z.object({
				folderId: z.string(),
				newName: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				if (ctx && ctx.session && !ctx.session.user) {
					throw new TRPCError({
						message: 'Not authorized',
						code: 'BAD_REQUEST',
					});
				}

				const updatedFolder = await ctx.prisma.folder.update({
					where: {
						id: input.folderId,
					},
					data: {
						name: input.newName,
					},
					select: {
						id: true,
						name: true,
					},
				});

				return updatedFolder;
			} catch (e) {
				throw new TRPCError({
					message: JSON.stringify(e),
					code: 'BAD_REQUEST',
				});
			}
		}),
	updateFolderPosition: t.procedure
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
			try {
				if (ctx && ctx.session && !ctx.session.user) {
					throw new TRPCError({
						message: 'Not authorized',
						code: 'BAD_REQUEST',
					});
				}

				const reversedFolderList = input.reverse();
				for (const index in reversedFolderList) {
					await ctx.prisma.folder.update({
						where: {
							id: reversedFolderList[index]?.id,
						},
						data: {
							position: parseInt(index),
						},
					});
				}
			} catch (e) {
				throw new TRPCError({
					message: 'There has been an error',
					code: 'INTERNAL_SERVER_ERROR',
				});
			}
		}),
	folderDelete: t.procedure
		.input(
			z.object({
				userId: z.string(),
				folderId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			////

			try {
				if (ctx && ctx.session && !ctx.session.user) {
					throw new TRPCError({
						message: 'Not authorized',
						code: 'BAD_REQUEST',
					});
				}

				const deletedFolder = await ctx.prisma.folder.delete({
					where: {
						id: input.folderId,
					},
					select: {
						id: true,
					},
				});

				return deletedFolder;
			} catch (e) {
				throw new TRPCError({
					message: 'There was an error',
					code: 'BAD_REQUEST',
				});
			}
		}),
});

import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { t } from '../trpc';
import { taskReturn } from './board';

export const taskRouter = t.router({
	create: t.procedure
		.input(
			z.object({
				sectionId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const tasks = await ctx.prisma.task.count({
					where: {
						sectionId: input.sectionId,
					},
				});
				const newTask = await ctx.prisma.task.create({
					data: {
						sectionId: input.sectionId,
						position: tasks > 0 ? tasks + 1 : 1,
					},
					select: {
						...taskReturn,
					},
				});
				return newTask;
			} catch (e) {
				console.log(e);
				throw new TRPCError({
					message: (e as Error).message,
					code: 'INTERNAL_SERVER_ERROR',
				});
			}
		}),

	update: t.procedure
		.input(
			z.object({
				id: z.string(),
				title: z.string(),
				content: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const task = await ctx.prisma.task.update({
					where: {
						id: input.id,
					},
					data: {
						title: input.title,
						content: input.content,
					},
					select: {
						...taskReturn,
					},
				});
				return task;
			} catch (e) {
				console.log(e);
				throw new TRPCError({
					message: (e as Error).message,
					code: 'INTERNAL_SERVER_ERROR',
				});
			}
		}),

	delete: t.procedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const task = await ctx.prisma.task.delete({
					where: {
						id: input.id,
					},
				});
				const tasks = await ctx.prisma.task.findMany({
					where: { sectionId: task.sectionId },
					orderBy: { position: 'asc' },
				});
				tasks.forEach(async (task, index) => {
					await ctx.prisma.task.update({
						where: { id: task.id },
						data: { position: index },
					});
				});
				return { message: 'Task deleted successfully' };
			} catch (e) {
				console.log(e);
				throw new TRPCError({
					message: (e as Error).message,
					code: 'INTERNAL_SERVER_ERROR',
				});
			}
		}),

	updatePosition: t.procedure
		.input(
			z.object({
				resourceList: z.array(
					z.object({
						id: z.string(),
						position: z.number(),
					})
				),
				destinationList: z.array(
					z.object({
						id: z.string(),
						position: z.number(),
					})
				),
				resourceSectionId: z.string(),
				destinationSectionId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			//
			try {
				const reversedResourceList = input.resourceList.reverse();
				const reversedDestinationList = input.destinationList.reverse();

				// ------------------ LOOP over the list and reassign the position based on for loop index ------------------

				if (input.resourceSectionId !== input.destinationSectionId) {
					for (const key in reversedResourceList) {
						await ctx.prisma.task.update({
							where: { id: reversedResourceList[key]?.id },
							data: {
								sectionId: input.resourceSectionId,
								position: parseInt(key),
							},
						});
					}
				}
				for (const key in reversedDestinationList) {
					const task = await ctx.prisma.task.update({
						where: { id: reversedDestinationList[key]?.id },
						data: {
							sectionId: input.destinationSectionId,
							position: parseInt(key),
						},
					});
				}

				return { success: true };
			} catch (e) {
				console.log(e);
				throw new TRPCError({
					message: (e as Error).message,
					code: 'INTERNAL_SERVER_ERROR',
				});
			}
		}),
	toggleArchived: t.procedure
		.input(z.object({ taskId: z.string(), prevState: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const task = await ctx.prisma.task.update({
					where: { id: input.taskId },
					data: { archived: !input.prevState },
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

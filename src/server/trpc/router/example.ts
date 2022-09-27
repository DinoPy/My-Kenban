import { t } from '../trpc';
import { z } from 'zod';

export const exampleRouter = t.router({
	hello: t.procedure
		// -- input defines the required input from the client side it uses zod
		.input(z.object({ text: z.string().nullish() }).nullish())
		// query is the function that will be called when the client calls this procedure
		.query(({ input }) => {
			return {
				greeting: `Hello ${input?.text ?? 'world'}`,
			};
		}),
	getAll: t.procedure.query(({ ctx }) => {
		// ctx - prisma - example collection -- function
		return ctx.prisma.example.findMany();
	}),
});

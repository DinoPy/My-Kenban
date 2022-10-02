import { taskRouter } from './task';
// src/server/trpc/router/index.ts
import { t } from '../trpc';
import { authRouter } from './auth';
import { boardRouter } from './board';
import { sectionRouter } from './section';

export const appRouter = t.router({
	auth: authRouter,
	board: boardRouter,
	section: sectionRouter,
	task: taskRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

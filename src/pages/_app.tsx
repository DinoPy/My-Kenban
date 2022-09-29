// src/pages/_app.tsx
import Head from 'next/head';
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { AppType } from 'next/app';
import { trpc } from '../utils/trpc';

import CssBaseLine from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
	palette: { mode: 'dark' },
});

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<>
			<Head>
				<title>Kenban</title>
				<meta name='description' content='Kenban t3 stack' />
				<link rel='icon' href='/app-icon.png' />
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseLine />
				<SessionProvider session={session}>
					<Component {...pageProps} />
				</SessionProvider>
			</ThemeProvider>
		</>
	);
};

export default trpc.withTRPC(MyApp);

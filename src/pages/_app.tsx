// src/pages/_app.tsx
import Head from 'next/head';
import '../styles/globals.css';
import '../css/custom-ckeditor.css';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { AppType } from 'next/app';
import { trpc } from '../utils/trpc';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '../css/custom-scrollbar.css';

import CssBaseLine from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { store } from '../redux/store';
import { Provider } from 'react-redux';

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
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<CssBaseLine />
					{/* <Provider store={store}> */}
					<SessionProvider session={session}>
						<Component {...pageProps} />
					</SessionProvider>
					{/* </Provider> */}
				</ThemeProvider>
			</Provider>
			<ReactQueryDevtools initialIsOpen={false} />
		</>
	);
};

export default trpc.withTRPC(MyApp);

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
import { amber } from '@mui/material/colors';
import { useState, useEffect } from 'react';

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	const [themeValue, setThemeValue] = useState(true);

	const theme = createTheme({
		// palette: {
		// 	mode: 'dark',
		// },
		...(themeValue === true
			? {
					palette: {
						mode: 'dark',
					},

					// palette: {
					// 	// mode: 'dark',

					// 	primary: {
					// 		main: amber.A700,
					// 		'100': '#f00',
					// 		contrastText: '#fff',
					// 		// dark: '#000',
					// 		// light: '#000',
					// 	},
					// 	common: {},
					// 	warning: { main: amber.A700 },
					// 	action: {
					// 		// default icons color v
					// 		active: '#000',
					// 		// selected: 'rgba(0,0,0,0.1)',

					// 		selectedOpacity: 0.1,
					// 		activatedOpacity: 0.8,
					// 	},
					// 	grey: {
					// 		900: amber.A400,
					// 		'800': amber[100],
					// 		// '50': '#000',
					// 		// '100': '#000',
					// 		// A100: '#000',
					// 		// A200: '#000',
					// 		// A400: '#000',
					// 		// A700: '#000',
					// 		// '200': '#000',
					// 		// '300': '#000',
					// 	},

					// 	background: {
					// 		default: amber.A700,
					// 		paper: amber[300],
					// 	},
					// 	text: {
					// 		primary: '#252525',
					// 		secondary: '#000',
					// 		disabled: '#000',
					// 	},
					// },
					// // components: {
					// // 	MuiIcon: {
					// // 		styleOverrides: {
					// // 			root: 'amber',
					// // 		},
					// // 	},
					// // },
			  }
			: {
					palette: {
						mode: 'light',
						grey: {
							900: amber.A100, //
							800: amber[300],
						},
						background: {
							default: amber[50],
							paper: amber[100],
						},
						action: {
							active: '#252525',
							selected: '#fff',
							// selectedOpacity: 0.6,
						},

						primary: { main: amber[900] },
					},
					components: {
						MuiListItemButton: {
							styleOverrides: {
								root: {
									'&.Mui-selected': {
										backgroundColor: amber[300],
										'&:hover': {
											backgroundColor: `${amber[300]}80`,
										},
									},
								},
							},
						},
					},
			  }),
	});

	useEffect(() => {
		const themeToggle = localStorage.getItem('themeToggled');
		if (themeToggle === null) {
			localStorage.setItem('themeToggled', 'true');
		} else {
			setThemeValue(JSON.parse(themeToggle));
		}
	}, []);

	return (
		<>
			<Head>
				<title>Kenban</title>
				<meta name='description' content='Kenban t3 stack' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/app-icon.png' />
			</Head>
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<CssBaseLine />
					<SessionProvider session={session} refetchInterval={1800}>
						<Component
							{...pageProps}
							setThemeValue={setThemeValue}
							themeValue={themeValue}
						/>
					</SessionProvider>
				</ThemeProvider>
			</Provider>
			<ReactQueryDevtools initialIsOpen={false} />
		</>
	);
};

export default trpc.withTRPC(MyApp);

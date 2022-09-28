import type { NextPage } from 'next';
import Head from 'next/head';
import { trpc } from '../utils/trpc';
import { signIn, signOut, useSession } from 'next-auth/react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>Kenban</title>
				<meta name='description' content='Kenban t3 stack' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div>Thing</div>
		</>
	);
};

export default Home;

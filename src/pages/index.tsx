import type { NextPage } from 'next';
import AppLayout from '../components/layouts/AppLayout';
import Head from 'next/head';
import { trpc } from '../utils/trpc';
import { signIn, signOut, useSession } from 'next-auth/react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const Home: NextPage = () => {
	const { data: session, status } = useSession();
	return (
		<AppLayout>
			<div>Thing</div>
			<div> {JSON.stringify(session)} </div>
			<button onClick={(e) => signOut({ redirect: false })}> Sign out</button>
		</AppLayout>
	);
};

export default Home;

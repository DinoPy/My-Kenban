import { Box, Container } from '@mui/material';
import React from 'react';
import assets from '../../assets/assets';
import Loading from '../common/Loading';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Sidebar from '../common/Sidebar';

const AppLayout = ({ children }: any) => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [loading, setLoading] = React.useState(!session ? true : false);

	React.useEffect(() => {
		if (!session?.user && status === 'unauthenticated') {
			setLoading(true);
			router.push('/user/signin');
		}
		if (session && status === 'authenticated') {
			setLoading(false);
		}
	}, [status, session, router]);

	return loading ? (
		<Loading fullHeight />
	) : (
		<Box sx={{ display: 'flex' }}>
			<Sidebar />
			<Box
				sx={{
					flexGrow: 1,
					p: 1,
					width: 'max-content',
				}}
			></Box>
			{children}
		</Box>
	);
};

export default AppLayout;

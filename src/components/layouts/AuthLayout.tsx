import { Box, Container } from '@mui/material';
import Image from 'next/future/image';
import React from 'react';
import assets from '../../assets/assets';
import Loading from '../common/Loading';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const AuthLayout = ({ children }: any) => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [loading, setLoading] = React.useState(
		status === 'loading' ? true : false
	);

	React.useEffect(() => {
		setLoading(status === 'loading' ? true : false);

		if (status === 'authenticated') {
			router.push('/');
		}
	}, [status]);

	return loading ? (
		<Loading fullHeght />
	) : (
		<Container component='main' maxWidth='xs'>
			<Box
				sx={{
					marginTop: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<Box
					sx={{
						width: '400px',
						height: '300px',
						position: 'relative',
						marginBottom: 8,
					}}
				>
					<Image
						src={assets.images.logoDark}
						alt={'Logo'}
						style={{ width: '100%', height: '100%', borderRadius: '10px' }}
					/>
				</Box>
				{children}
			</Box>
		</Container>
	);
};

export default AuthLayout;

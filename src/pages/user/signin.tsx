import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Box, Button, TextField } from '@mui/material';
import { signIn, signOut, useSession } from 'next-auth/react';

function SignIn() {
	const [loading, setLoading] = React.useState(false);
	const [emailErr, setEmailErr] = React.useState('');
	const [passwordErr, setPasswordErr] = React.useState('');

	const { data: session, status } = useSession();
	console.log(session);

	const handleSignIn = async (event: any) => {
		event.preventDefault();
		const res = await signIn('credentials', {
			email: 'login',
			password: 'login',
			redirect: false,
		});
		console.log(res);
		console.log(session);
	};
	return (
		<Box
			component='form'
			onSubmit={(event) => handleSignIn(event)}
			noValidate
			// sx={{ maxWidth: '600px', margin: '2em' }}
		>
			<TextField
				id='email'
				type='email'
				label='Email'
				variant='standard'
				name='email'
				error={emailErr !== ''}
				helperText={emailErr}
				disabled={loading}
				required
				color='success'
				fullWidth
			/>
			<TextField
				id='password'
				type='password'
				label='Password'
				variant='standard'
				name='password'
				error={passwordErr !== ''}
				helperText={passwordErr}
				disabled={loading}
				required
				color='success'
				fullWidth
			/>
			<LoadingButton
				variant='outlined'
				color='success'
				type='submit'
				disabled={loading}
				loading={loading}
				fullWidth
				sx={{ mt: 5 }}
			>
				Login
			</LoadingButton>
			<Button onClick={(e) => signIn('discord')}> Signin with Discord</Button>
			{JSON.stringify(session)}, {status}
			<Button onClick={(e) => signOut()}> SignOut </Button>
		</Box>
	);
}

export default SignIn;

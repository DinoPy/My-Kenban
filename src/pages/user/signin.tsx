import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Box, Button, TextField } from '@mui/material';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AuthLayout from '../../components/layouts/AuthLayout';
import Image from 'next/future/image';
import Link from 'next/link';

function SignIn() {
	const [loading, setLoading] = React.useState(false);
	const [emailErr, setEmailErr] = React.useState('');
	const [passwordErr, setPasswordErr] = React.useState('');

	const { data: session, status } = useSession();
	const router = useRouter();

	const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setEmailErr('');
		setPasswordErr('');

		const formData = new FormData(event.target as HTMLFormElement);

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email) {
			setEmailErr('Email is required');
			return;
		}

		if (!password) {
			setPasswordErr('Password is required');
			return;
		}

		setLoading(true);

		const res = await signIn('credentials', {
			email: email,
			password: password,
			redirect: false,
		});
		console.log(res);

		switch (res?.ok) {
			case true: {
				setLoading(false);
				router.push('/');
				break;
			}
			case false: {
				if (res?.error?.includes('Email does not exist')) {
					setEmailErr('Email does not exist');
				} else if (res?.error?.includes('Incorrect password')) {
					setPasswordErr('Incorrect password');
				}
				setLoading(false);
			}
		}
	};

	return (
		<AuthLayout>
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
					variant='outlined'
					name='email'
					error={emailErr !== ''}
					helperText={emailErr}
					disabled={loading}
					required
					color='success'
					fullWidth
					sx={{ mb: 1 }}
				/>
				<TextField
					id='password'
					type='password'
					label='Password'
					variant='outlined'
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
					sx={{ mt: 4 }}
				>
					Login
				</LoadingButton>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
					<Button
						onClick={(e) => signIn('discord', { redirect: false })}
						variant='outlined'
					>
						{' '}
						<Image
							src='/discord.svg'
							width={25}
							height={25}
							alt='Discord Logo'
							style={{ marginRight: '0.5em' }}
						/>
						Signin with Discord
					</Button>
					<Button
						onClick={(e) => signIn('google', { redirect: false })}
						variant='outlined'
						sx={{ ml: 2 }}
					>
						{' '}
						<Image
							src='/google.svg'
							width={25}
							height={25}
							alt='Google Logo'
							style={{ marginRight: '0.5em' }}
						/>{' '}
						Signin with Google
					</Button>
				</Box>
				<Button sx={{ textAlign: 'center', width: '100%' }}>
					<Link href='/user/register'> You don&apos;t have an account?</Link>
				</Button>
			</Box>
		</AuthLayout>
	);
}

export default SignIn;

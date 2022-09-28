import { LoadingButton } from '@mui/lab';
import { Box, TextField } from '@mui/material';
import { TRPCClientError } from '@trpc/client';
import React from 'react';
import { trpc } from '../../utils/trpc';
import { useRouter } from 'next/router';

const Register = () => {
	const [loading, setLoading] = React.useState(false);
	const [nameError, setNameError] = React.useState('');
	const [emailErr, setEmailErr] = React.useState('');
	const [passwordErr, setPasswordErr] = React.useState('');
	const [confirmPasswordErr, setConfirmPasswordErr] = React.useState('');

	const registerMutation = trpc.auth.register.useMutation();
	const [data, setData] = React.useState('');
	const router = useRouter();

	const handleSubmit = async (event: any) => {
		event.preventDefault();

		setNameError('');
		setEmailErr('');
		setPasswordErr('');
		setConfirmPasswordErr('');

		//

		const formData = new FormData(event.target as HTMLFormElement);

		const username = formData.get('name') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		setLoading(true);

		try {
			const response = await registerMutation.mutateAsync({
				username,
				email,
				password,
				confirmPassword,
			});
			setData(JSON.stringify(response, null, 2));

			router.push('/api/auth/signin');

			setLoading(false);
		} catch (e) {
			if (e instanceof TRPCClientError) {
				const { fieldErrors } = e.data?.zodError || {};

				if (
					e.data.code === 'CONFLICT' &&
					e.data.stack.includes('Email already exists')
				) {
					setEmailErr('Email already exists');
				}

				setData(JSON.stringify(e.data, null, 2));
				if (fieldErrors) {
					const keys = Object?.keys(e.data?.zodError?.fieldErrors);
					keys.forEach((key) => {
						if (key === 'username') {
							setNameError(fieldErrors[key]);
						} else if (key === 'email') {
							setEmailErr(fieldErrors[key]);
						} else if (key === 'password') {
							setPasswordErr(fieldErrors[key][fieldErrors[key].length - 1]);
						} else if (key === 'confirmPassword') {
							setConfirmPasswordErr(fieldErrors[key]);
						}
					});
				}

				setLoading(false);
			}
		}
	};
	return (
		<div>
			<pre> {data} </pre>
			<Box
				component='form'
				onSubmit={handleSubmit}
				noValidate
				// sx={{ maxWidth: '600px', margin: '2em' }}
			>
				<TextField
					id='name'
					label='Name'
					variant='standard'
					name='name'
					error={nameError !== ''}
					helperText={nameError}
					disabled={loading}
					required
					color='success'
					fullWidth
				/>
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
				<TextField
					id='confirmPassword'
					type='password'
					label='Confirm Password'
					variant='standard'
					name='confirmPassword'
					error={confirmPasswordErr !== ''}
					helperText={confirmPasswordErr}
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
					Register
				</LoadingButton>
			</Box>
		</div>
	);
};

export default Register;

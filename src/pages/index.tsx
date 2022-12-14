import React from 'react';
import type { NextPage } from 'next';
import AppLayout from '../components/layouts/AppLayout';

import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setBoards } from '../redux/features/boardSlice';
import { trpc } from '../utils/trpc';
import { useSession } from 'next-auth/react';
import Board from '../components/Board';
import { setActiveBoard } from '../redux/features/activeBoardSlice';
import { setFolders } from '../redux/features/folderSlice';

const Home: NextPage<{
	setThemeValue: (val: boolean) => void;
	themeValue: boolean;
}> = ({ setThemeValue, themeValue }) => {
	const dispatch = useAppDispatch();
	const boards = useAppSelector((state) => state.board.value);
	const folders = useAppSelector((state) => state.folders.value);
	const { data: session } = useSession();
	const ctx = trpc.useContext();

	const folderMutation = trpc.folder.create.useMutation({
		onSuccess(data) {
			ctx.board.getAll.invalidate();
			dispatch(setBoards(data?.Board));
			dispatch(setFolders([data]));
			dispatch(setActiveBoard(data?.Board[0]?.id));
		},
	});

	const [loading, setLoading] = React.useState(false);

	const createBoard = async () => {
		setLoading(true);
		try {
			if (session && session.user && session.user.id) {
				await folderMutation.mutateAsync({ userId: session?.user?.id });
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		const savedBoard = localStorage.getItem('activeBoard');
		if (savedBoard) dispatch(setActiveBoard(savedBoard));
	}, [dispatch]);

	return (
		<AppLayout>
			{boards?.length < 1 && folders?.length < 1 ? (
				<Box
					sx={{
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<LoadingButton
						variant='outlined'
						color='success'
						onClick={() => createBoard()}
						loading={loading}
					>
						Click here to create your first board
					</LoadingButton>
				</Box>
			) : (
				<Board setThemeValue={setThemeValue} themeValue={themeValue} />
			)}
		</AppLayout>
	);
};

export default Home;

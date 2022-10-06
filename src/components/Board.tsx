import DeleteForever from '@mui/icons-material/DeleteForever';
import Star from '@mui/icons-material/Star';
import StarOutline from '@mui/icons-material/StarOutline';
import { Box, IconButton, TextField } from '@mui/material';
import React from 'react';
import { setBoards } from '../redux/features/boardSlice';
import { setFavoritedBoards } from '../redux/features/favoritedBoardsSlice';
import { setActiveBoard } from '../redux/features/activeBoardSlice';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { trpc } from '../utils/trpc';
import EmojiPicker from './common/EmojiPicker';
import Kenban, { SectionInterface } from '../components/common/Kanban';
import { useSession } from 'next-auth/react';

let timer: NodeJS.Timeout;
const timeout = 500;

const Board = () => {
	const { data: session } = useSession();
	const dispatch = useAppDispatch();
	const activeBoard = useAppSelector((state) => state.activeBoard.value);
	const boards = useAppSelector((state) => state.board.value);
	const favoritedBoards = useAppSelector(
		(state) => state.favoritedBoards.value
	);
	const currentBoard = boards.find((board) => board.id === activeBoard);

	const [title, setTitle] = React.useState(currentBoard?.title);
	const [description, setDescription] = React.useState(
		currentBoard?.description
	);
	const [sections, setSections] = React.useState<SectionInterface['sections']>(
		[]
	);
	const [isFavorite, setIsFavorite] = React.useState(currentBoard?.favorite);
	const [icon, setIcon] = React.useState(currentBoard?.icon || '📝');

	// TRPC Queries
	const { refetch } = trpc.board.getOne.useQuery(
		{ id: activeBoard },
		{ enabled: false }
	);
	const boardMutation = trpc.board.update.useMutation();
	const boardDeleteMutation = trpc.board.deleteBoard.useMutation();

	// get data for the individual board
	React.useEffect(() => {
		const fetchBoard = async () => {
			const { data } = await refetch();
			setTitle(data?.title);
			setDescription(data?.description);
			setSections(data?.Section || []);
			setIsFavorite(data?.favorite);
			setIcon(data?.icon || '📝');
		};

		fetchBoard();

		console.log(sections);
	}, [activeBoard, refetch]);

	// update the emoji icon
	const onEmojiChange = (emoji: string) => {
		setIcon(emoji);
		const updatedBoards = boards.map((board) => {
			if (board.id === activeBoard) {
				return {
					...board,
					icon: emoji,
				};
			}
			return board;
		});

		if (isFavorite) {
			const updatedFavoritedBoards = favoritedBoards.map((board) => {
				if (board.id === activeBoard) {
					return {
						...board,
						icon: emoji,
					};
				}
				return board;
			});
			dispatch(setFavoritedBoards(updatedFavoritedBoards));
		}

		dispatch(setBoards(updatedBoards));
		boardMutation.mutateAsync({
			id: activeBoard,
			description,
			title,
			icon: emoji,
			favorite: isFavorite,
		});
	};

	const updateTitle = async (e: React.ChangeEvent<HTMLInputElement>) => {
		clearTimeout(timer);
		const newTitle = e.target.value;
		setTitle(newTitle);

		const updatedBoards = boards.map((b) => {
			if (b.id === activeBoard) {
				return {
					...b,
					title: newTitle,
				};
			}
			return b;
		});

		if (isFavorite) {
			const tempFav = favoritedBoards.map((b) => {
				if (b.id === activeBoard) {
					return {
						...b,
						title: newTitle,
					};
				}
				return b;
			});

			dispatch(setFavoritedBoards(tempFav));
		}

		dispatch(setBoards(updatedBoards));

		timer = setTimeout(async () => {
			await boardMutation.mutateAsync({
				id: activeBoard,
				description,
				title: newTitle,
				icon,
				favorite: isFavorite,
			});
		}, timeout);
	};

	const updateDescription = async (e: React.ChangeEvent<HTMLInputElement>) => {
		clearTimeout(timer);
		const newDescription = e.target.value;
		setDescription(newDescription);

		const temp = boards.map((b) => {
			if (b.id === activeBoard) {
				return {
					...b,
					description: newDescription,
				};
			}
			return b;
		});

		dispatch(setBoards(temp));

		timer = setTimeout(async () => {
			try {
				await boardMutation.mutateAsync({
					id: activeBoard,
					description: newDescription,
					title,
					icon,
					favorite: isFavorite,
				});
			} catch (error) {
				console.error(error);
			}
		}, timeout);
	};

	const toggleFavorite = async () => {
		try {
			await boardMutation.mutateAsync({
				id: activeBoard,
				description,
				title,
				icon,
				favorite: !isFavorite,
			});
			setIsFavorite(!isFavorite);

			if (isFavorite) {
				const updatedFavoritedBoards = favoritedBoards.filter(
					(board) => board.id !== activeBoard
				);
				dispatch(setFavoritedBoards(updatedFavoritedBoards));
			} else {
				const updatedFavoritedBoards = [
					...favoritedBoards,
					boards.find((board) => board.id === activeBoard),
				];
				dispatch(setFavoritedBoards(updatedFavoritedBoards));
			}
		} catch (e) {
			console.log(e);
		}
	};

	const onDeleteBoard = async () => {
		try {
			await boardDeleteMutation.mutateAsync({
				id: activeBoard,
				userId: String(session?.user?.id),
			});

			const updatedBoards = boards.filter((board) => board.id !== activeBoard);
			dispatch(setBoards(updatedBoards));

			dispatch(setActiveBoard(updatedBoards[0]?.id));

			if (isFavorite) {
				const updatedFavoritedBoards = favoritedBoards.filter(
					(board) => board.id !== activeBoard
				);
				dispatch(setFavoritedBoards(updatedFavoritedBoards));
			}
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<div>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%',
				}}
			>
				<IconButton onClick={() => toggleFavorite()}>
					{
						isFavorite ? (
							//
							<Star color='warning' />
						) : (
							<StarOutline />
						)
						//
					}
				</IconButton>
				<IconButton color='error' onClick={onDeleteBoard}>
					<DeleteForever />
				</IconButton>
			</Box>

			<Box sx={{ padding: '10px 50px' }}>
				<Box>
					<EmojiPicker icon={icon} onChange={onEmojiChange} />
					<TextField
						value={title}
						onChange={updateTitle}
						placeholder='Untitled'
						variant='outlined'
						fullWidth
						sx={{
							'& .MuiOutlinedInput-input': { padding: 0 },
							'& .MuiOutlinedInput-root': { fontSize: '2rem', fontWeight: 700 },
							'& .MuiOutlinedInput-notchedOutline': { border: 'unset' },
						}}
					/>
					<TextField
						value={description}
						onChange={updateDescription}
						placeholder='Add a description'
						variant='outlined'
						multiline
						fullWidth
						sx={{
							'& .MuiOutlinedInput-input': { padding: 0 },
							'& .MuiOutlinedInput-root': { fontSize: '1rem' },
							'& .MuiOutlinedInput-notchedOutline': { border: 'unset' },
						}}
					/>
				</Box>

				<Box
					sx={(theme) => ({
						[theme.breakpoints.down('sm')]: {
							fontSize: '12px',
						},
					})}
				>
					<Kenban sections={sections} />
				</Box>
			</Box>
		</div>
	);
};

export default Board;

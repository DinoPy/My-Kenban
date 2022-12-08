import DeleteForever from '@mui/icons-material/DeleteForever';
import Star from '@mui/icons-material/Star';
import StarOutline from '@mui/icons-material/StarOutline';
import {
	Box,
	Checkbox,
	IconButton,
	styled,
	Switch,
	TextField,
	Tooltip,
} from '@mui/material';
import React from 'react';
import { setBoards } from '../redux/features/boardSlice';
import { setFavoritedBoards } from '../redux/features/favoritedBoardsSlice';
import { setActiveBoard } from '../redux/features/activeBoardSlice';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { trpc } from '../utils/trpc';
import EmojiPicker from './common/EmojiPicker';
import Kenban, { SectionInterface } from '../components/common/Kanban';
import { useSession } from 'next-auth/react';
import { setFolders } from '../redux/features/folderSlice';
import MuiMenu from './utility/MuiMenu';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveIcon from '@mui/icons-material/Unarchive';

let timer: NodeJS.Timeout;
const timeout = 500;

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
	width: 62,
	height: 34,
	padding: 7,
	'& .MuiSwitch-switchBase': {
		margin: 1,
		padding: 0,
		transform: 'translateX(6px)',
		'&.Mui-checked': {
			color: '#fff',
			transform: 'translateX(22px)',
			'& .MuiSwitch-thumb:before': {
				backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
					'#fff'
				)}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
			},
			'& + .MuiSwitch-track': {
				opacity: 1,
				backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
			},
		},
	},
	'& .MuiSwitch-thumb': {
		backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
		width: 32,
		height: 32,
		'&:before': {
			content: "''",
			position: 'absolute',
			width: '100%',
			height: '100%',
			left: 0,
			top: 0,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
			backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
				'#fff'
			)}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
		},
	},
	'& .MuiSwitch-track': {
		opacity: 1,
		backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
		borderRadius: 20 / 2,
	},
}));

const Board = ({
	setThemeValue,
	themeValue,
}: {
	setThemeValue: (val: boolean) => void;
	themeValue: boolean;
}) => {
	const { data: session } = useSession();
	const dispatch = useAppDispatch();
	const activeBoard = useAppSelector((state) => state.activeBoard.value);
	console.log(activeBoard);
	const boards = useAppSelector((state) => state.board.value);
	const folders = useAppSelector((state) => state.folders.value);
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
	const [isArchived, setIsArchived] = React.useState(currentBoard?.archived);

	// TRPC Queries
	const { refetch } = trpc.board.getOne.useQuery(
		{ id: activeBoard },
		{ enabled: false }
	);
	const boardMutation = trpc.board.update.useMutation();
	const boardDeleteMutation = trpc.board.deleteBoard.useMutation();
	const boardArchiveMutation = trpc.board.archiveBoard.useMutation();

	// get data for the individual board
	React.useEffect(() => {
		const fetchBoard = async () => {
			const { data } = await refetch();
			setTitle(data?.title);
			setDescription(data?.description);
			setSections(data?.Section.sort((a, b) => a.position - b.position) || []);
			setIsFavorite(data?.favorite);
			setIcon(data?.icon || '📝');
			setIsArchived(data?.archived || false);
		};

		fetchBoard();
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
			const data = await boardDeleteMutation.mutateAsync({
				id: activeBoard,
				userId: String(session?.user?.id),
				folderId: String(currentBoard?.folderId),
			});

			const updatedBoards = boards.filter((board) => board.id !== activeBoard);
			dispatch(setBoards(updatedBoards));

			const newFolders = folders
				.map((f) => {
					return { ...f, Board: f.Board.filter((i) => i.id !== data!.id) };
				})
				.filter((f) => f.Board.length > 0);

			dispatch(setFolders(newFolders));
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

	const handleArchiveBoard = async (archived: boolean | undefined) => {
		///
		setIsArchived((prev) => !prev);

		const newBoards = boards.map((b) =>
			b.id === currentBoard?.id ? { ...b, archived: !b.archived } : b
		);

		dispatch(setBoards(newBoards));

		try {
			if (currentBoard && currentBoard.id && typeof archived === 'boolean') {
				await boardArchiveMutation.mutateAsync({
					boardId: currentBoard?.id,
					prevState: archived,
				});
			}
		} catch (e) {
			console.log(e);
		}

		// if (currentBoard?.id === activeBoard && !archived) {
		// 	dispatch(setActiveBoard(newBoards[0]?.id));
		// }
	};

	const handleThemeToggle = async () => {
		setThemeValue(!themeValue);
		localStorage.setItem('themeToggled', `${!themeValue}`);
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
				<Box>
					<Tooltip title='Favorite board'>
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
					</Tooltip>
					<Tooltip title='Archive board'>
						<Checkbox
							icon={<ArchiveOutlinedIcon color='info' />}
							checkedIcon={<UnarchiveIcon color='success' />}
							checked={isArchived}
							onChange={() => {
								handleArchiveBoard(isArchived);
							}}
						/>
					</Tooltip>
				</Box>

				<Box sx={{ display: 'flex' }}>
					<MuiMenu />
					<Tooltip title='Toggle theme'>
						<MaterialUISwitch
							checked={themeValue}
							onChange={() => handleThemeToggle()}
						/>
					</Tooltip>
					<Tooltip title='Delete Board'>
						<IconButton
							color='error'
							onClick={() =>
								window.confirm(
									'Are you sure you want to permanenly delete this board?'
								) && onDeleteBoard()
							}
						>
							<DeleteForever />
						</IconButton>
					</Tooltip>
				</Box>
			</Box>

			<Box
				sx={(theme) => ({
					[theme.breakpoints.down('sm')]: {
						padding: '10px 10px',
					},
					[theme.breakpoints.up('sm')]: {
						padding: '10px 50px',
					},
				})}
			>
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

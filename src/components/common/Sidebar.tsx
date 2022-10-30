import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { trpc } from '../../utils/trpc';
import { setBoards } from '../../redux/features/boardSlice';
import { setActiveBoard } from '../../redux/features/activeBoardSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
	Box,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	Drawer,
	Typography,
	Accordion,
	AccordionSummary,
	AccordionDetails,
} from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import MenuIcon from '@mui/icons-material/Menu';

import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult,
} from 'react-beautiful-dnd';
import { setFavoritedBoards } from '../../redux/features/favoritedBoardsSlice';
import Favorites from './Favorites';
import { setFolders } from '../../redux/features/folderSlice';

const Sidebar = () => {
	const { data: session } = useSession();
	const dispatch = useAppDispatch();
	const sidebarWidth = 250;

	const [sideBarOpen, setSideBarOpen] = React.useState(false);

	const boards = useAppSelector((state) => state.board.value);
	const activeBoard = useAppSelector((state) => state.activeBoard.value);
	const folders = useAppSelector((state) => state.folders.value);

	const ctx = trpc.useContext();

	const { refetch } = trpc.board.getAll.useQuery(
		{ userId: String(session?.user?.id) },
		{ enabled: false, refetchOnWindowFocus: true }
	);
	const boardPositionUpdateMutation = trpc.board.updatePosition.useMutation();
	const boardMutation = trpc.board.create.useMutation({
		onSuccess(data) {
			ctx.board.getAll.invalidate();
			dispatch(setBoards([data, ...boards]));
			dispatch(setActiveBoard(data.id));
		},
	});
	const folderMutation = trpc.folder.create.useMutation({
		onSuccess(data) {
			ctx.board.getAll.invalidate();
			// getBoards();
			dispatch(setFolders([data, ...folders]));
			dispatch(setBoards([data?.Board[0], ...boards]));
			dispatch(setActiveBoard(data?.Board[0]?.id));
		},
	});

	const createBoard = async (folderId: string) => {
		try {
			if (session && session.user && session.user.id) {
				boardMutation.mutateAsync({
					userId: session?.user?.id,
					folderId,
				});
			}
		} catch (e) {
			console.error(e);
		}
	};

	const createFolder = async () => {
		try {
			if (session && session.user && session.user.id) {
				folderMutation.mutateAsync({
					userId: session.user.id,
				});
			}
		} catch (e) {
			console.log(e);
		}
	};

	const getBoards = async () => {
		const { data, isFetched } = await refetch();
		if (isFetched && data && data.boards?.length > 0) {
			dispatch(setBoards(data.boards));
			dispatch(setActiveBoard(data.boards[0]?.id));
			dispatch(
				setFavoritedBoards(
					data.boards
						.filter((board) => board.favorite)
						.sort((a, b) => a.favoritePosition - b.favoritePosition)
				)
			);
		}
		if (isFetched && data && data.folders.length > 0) {
			dispatch(setFolders(data.folders));
		}
	};

	{
		/** IF THE NUMBER OF BOARDS CHANGES <- REFETCH */
	}
	React.useEffect(() => {
		if (boards.length < 1) {
			getBoards();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onDragEnd = async (result: DropResult, folderId: string) => {
		const { destination, source } = result;
		console.log(result);

		if (!destination) {
			return;
		}

		// const newList = [...boards];
		const newList = boards.filter((b) => b.folderId === folderId);
		const [removed] = newList.splice(source.index, 1);
		newList.splice(destination!.index, 0, removed!);

		const nL = [...newList, ...boards.filter((b) => b.folderId !== folderId)];

		dispatch(setBoards(nL));

		try {
			await boardPositionUpdateMutation.mutateAsync({ boards: newList });
		} catch (e) {
			console.log(e);
		}

		//
	};

	{
		/** WINDOW DIMENSIONS RELEVANT FOR LAYOUT */
	}
	const [dimensions, setDimensions] = React.useState({
		height: window.innerHeight,

		width: window.innerWidth,
	});

	React.useEffect(() => {
		let timeout: NodeJS.Timeout;
		// clearTimeout(timeout)
		const effectCB = () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				setDimensions({
					height: window.innerHeight,
					width: window.innerWidth,
				});
			}, 250);
		};
		window.addEventListener('resize', effectCB);

		return () => {
			window.removeEventListener('resize', effectCB);
		};
	});

	return (
		<>
			{' '}
			{dimensions.width < 600 && (
				<IconButton
					onClick={() => setSideBarOpen(true)}
					sx={{ position: 'absolute', bottom: '5px', right: '5px' }}
				>
					<MenuIcon />
				</IconButton>
			)}
			<Drawer
				container={window.document.body}
				open={sideBarOpen}
				variant={dimensions.width < 600 ? 'temporary' : 'permanent'}
				anchor={dimensions.width < 600 ? 'right' : 'left'}
				onClose={() => setSideBarOpen(false)}
				sx={{
					width: sidebarWidth,
					height: '100vh',
					'& > div': {
						borderRight: 'none',
					},
				}}
			>
				<List
					disablePadding
					sx={{
						width: sidebarWidth,
						height: '100%',
						backgroundColor: 'grey.900',
					}}
				>
					{/** FIRST ROW OF SIDEBAR */}
					<ListItem>
						<Box
							sx={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Typography variant='body2' fontWeight={700}>
								{session?.user?.name}
							</Typography>
							<IconButton onClick={() => signOut()}>
								<LogoutOutlinedIcon fontSize='small' />
							</IconButton>
						</Box>
					</ListItem>
					{/** FAVORITES */}

					<Favorites />

					<Box sx={{ pt: '10px' }}>
						{/** THIRD ROW =  ADD BUTTON AND PRIVATE TEXT */}
						<ListItem>
							<Box
								sx={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<Typography variant='body2' fontWeight={700}>
									Private
								</Typography>
								<IconButton onClick={() => createFolder()}>
									<AddBoxOutlinedIcon fontSize='small' />
								</IconButton>
							</Box>
						</ListItem>

						{folders.map((folder) => (
							<Accordion key={folder.id}>
								<AccordionSummary expandIcon={<ExpandMoreIcon />}>
									<Box
										sx={{
											width: '100%',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
										}}
									>
										{folder.name}
										<IconButton onClick={() => createBoard(folder.id)}>
											<AddBoxOutlinedIcon fontSize='small' />
										</IconButton>
									</Box>
								</AccordionSummary>
								<AccordionDetails>
									<DragDropContext
										onDragEnd={(dragResult) => onDragEnd(dragResult, folder.id)}
									>
										<Droppable
											key={'list-board-droppable-key'}
											droppableId={'list-board-droppable'}
										>
											{(provided) => (
												<div
													ref={provided.innerRef}
													{...provided.droppableProps}
												>
													{boards
														?.filter((board) => board.folderId === folder.id)
														?.map((item, index) => (
															<Draggable
																key={item.id}
																draggableId={item.id}
																index={index}
															>
																{(provided, snapshot) => (
																	<ListItemButton
																		ref={provided.innerRef}
																		{...provided.dragHandleProps}
																		{...provided.draggableProps}
																		selected={item.id === activeBoard}
																		sx={{
																			pl: '20px',
																			cursor: snapshot.isDragging
																				? 'grab'
																				: 'pointer!important',
																		}}
																		onClick={() =>
																			dispatch(setActiveBoard(item.id))
																		}
																	>
																		<Typography
																			variant='body2'
																			fontWeight='700'
																			sx={{
																				whiteSpace: 'nowrap',
																				overflow: 'hidden',
																				textOverflow: 'ellipsis',
																			}}
																		>
																			{item.icon} {item.title}
																		</Typography>
																	</ListItemButton>
																)}
															</Draggable>
														))}
													{provided.placeholder}
												</div>
											)}
										</Droppable>
									</DragDropContext>
								</AccordionDetails>
							</Accordion>
						))}
					</Box>
				</List>
			</Drawer>
		</>
	);
};

export default Sidebar;

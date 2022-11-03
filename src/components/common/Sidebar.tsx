import React, { useState } from 'react';
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
	AccordionActions,
	TextField,
	Tooltip,
	Checkbox,
} from '@mui/material';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveIcon from '@mui/icons-material/Unarchive';

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

const timeout = 500;
let timer: NodeJS.Timeout;

const FolderTitle = ({
	currentTitle,
	folderId,
}: {
	currentTitle: string;
	folderId: string;
}) => {
	const [folderTitle, setFolderTitle] = useState(currentTitle);
	const folderNameMutation = trpc.folder.editName.useMutation();
	const dispatch = useAppDispatch();
	const folders = useAppSelector((state) => state.folders.value);

	const handleTitleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		e.preventDefault();
		setFolderTitle(e.target.value);
		clearTimeout(timer);

		timer = setTimeout(async () => {
			try {
				// call backend 	to update title when successfull edit in the folder structure
				const response = await folderNameMutation.mutateAsync({
					folderId,
					newName: e.target.value,
				});

				const newFolders = folders.map((f) =>
					f.id === response.id
						? {
								...f,
								name: response.name,
						  }
						: f
				);

				dispatch(setFolders(newFolders));
			} catch (e) {
				console.log(e);
			}
		}, timeout);
	};

	return (
		<Tooltip title='Rename folder'>
			<TextField
				inputProps={{ style: { fontSize: '.8rem' } }}
				variant='standard'
				value={folderTitle}
				onChange={(e) => handleTitleChange(e)}
			/>
		</Tooltip>
	);
};

const Sidebar = () => {
	const { data: session, status } = useSession();
	const dispatch = useAppDispatch();
	const sidebarWidth = 250;

	const [sideBarOpen, setSideBarOpen] = React.useState(false);

	const boards = useAppSelector((state) => state.board.value);
	const activeBoard = useAppSelector((state) => state.activeBoard.value);
	const folders = useAppSelector((state) => state.folders.value);
	const favorites = useAppSelector((state) => state.favoritedBoards.value);
	const isArchived = useAppSelector((state) => state.archived.value);

	/* TRPC functions below vvv **/

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
			dispatch(setFolders([data, ...folders]));
			dispatch(setBoards([data?.Board[0], ...boards]));
			dispatch(setActiveBoard(data?.Board[0]?.id));
		},
	});
	const folderPositionMutation = trpc.folder.updateFolderPosition.useMutation();
	const folderDeleteMutation = trpc.folder.folderDelete.useMutation();
	const folderArchiveMutation = trpc.folder.toggleArchived.useMutation();

	const createBoard = async (folderId: string) => {
		try {
			if (session && session.user && session.user.id) {
				const newBoard = await boardMutation.mutateAsync({
					userId: session?.user?.id,
					folderId,
				});

				dispatch(
					setFolders(
						folders.map((f) =>
							f.id === folderId ? { ...f, Board: [newBoard, ...f.Board] } : f
						)
					)
				);
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

		if (!destination) {
			return;
		}

		if (
			destination.droppableId === source.droppableId &&
			source.index === destination.index
		)
			return;

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

	const folderDragEnd = async (results: DropResult) => {
		////
		const { destination, source } = results;
		if (!destination) return;
		if (
			destination.droppableId === source.droppableId &&
			source.index === destination.index
		)
			return;

		const foldersCopy = [...folders];
		const removedFolder = foldersCopy.splice(source.index, 1);
		if (removedFolder[0])
			foldersCopy.splice(destination.index, 0, removedFolder[0]);
		dispatch(setFolders(foldersCopy));

		try {
			await folderPositionMutation.mutateAsync(foldersCopy);
		} catch (error) {
			console.log(error);
		}
	};

	const folderDelete = async (folderId: string) => {
		////
		try {
			if (session && session.user && session.user.id) {
				const deleted = await folderDeleteMutation.mutateAsync({
					userId: session.user.id,
					folderId: folderId,
				});
				const newFolders = folders.filter((f) => f.id !== deleted.id);

				// see if the active board was deleted and change it
				const isActiveBoardDeleted = !newFolders.some(
					(f) => f.Board.some((b) => b.id === activeBoard) === true
				);

				if (isActiveBoardDeleted) {
					dispatch(setActiveBoard(newFolders[0]?.Board[0]?.id));
				}
				if (boards.length < 1) dispatch(setActiveBoard(''));

				// see if deleted boards are favorited and remove them

				const newFavorites = favorites.filter(
					(fb) => fb.folderId !== deleted.id
				);
				dispatch(setFavoritedBoards(newFavorites));

				const newBoards = boards.filter((b) => b.folderId !== deleted.id);
				dispatch(setBoards(newBoards));

				dispatch(setFolders(newFolders));
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleArchiveFolder = async (folderId: string, archived: boolean) => {
		///
		const newFolders = folders.map((f) =>
			f.id === folderId ? { ...f, archived: !f.archived } : f
		);
		dispatch(setFolders(newFolders));

		try {
			await folderArchiveMutation.mutateAsync({
				folderId,
				prevStatus: archived,
			});
		} catch (e) {
			console.log(e);
		}

		// const currentFolder = folders.find((f) => f.id === folderId);
		// if (currentFolder?.Board.some((b) => b.id === activeBoard) && !archived) {
		// 	const currentBoards = currentFolder.Board.filter((b) => !b.archived);
		// 	dispatch(setActiveBoard(currentBoards[0].id));
		// }
	};

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
					boxShadow: dimensions.width > 600 ? 4 : 0,
				}}
			>
				<List
					disablePadding
					sx={{
						width: sidebarWidth,
						height: '100%',
						bgcolor: 'grey.900',
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
							<Tooltip title='Sign out'>
								<IconButton onClick={() => signOut()}>
									<LogoutOutlinedIcon fontSize='small' />
								</IconButton>
							</Tooltip>
						</Box>
					</ListItem>
					{/** FAVORITES */}

					<Favorites />

					<Box sx={{ pt: '10px' }}>
						{/** THIRD ROW =  ADD BUTTON AND PRIVATE TEXT */}
						<ListItem
							sx={{
								display: 'flex',
								flexDirection: 'column',
								borderBottom: 'grey 2px solid',
								marginBottom: 3,
							}}
						>
							<Box
								sx={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<Typography variant='body2' fontWeight={700}>
									{'Own Folders <- Boards'}
								</Typography>
								<Tooltip title='Create folder'>
									<IconButton onClick={() => createFolder()}>
										<AddBoxOutlinedIcon fontSize='small' />
									</IconButton>
								</Tooltip>
							</Box>
							<Box sx={{ width: '100%', textAlign: 'right' }}>
								<Typography variant='body2' fontSize={10} fontWeight={700}>
									{folders.length} Folders -{' '}
									{folders.filter((f) => !f.archived).length} Not-Archived
								</Typography>
							</Box>
						</ListItem>

						<DragDropContext onDragEnd={folderDragEnd}>
							<Droppable key='folder-drag-key' droppableId='folder-drag-id'>
								{(provided) => (
									<Box ref={provided.innerRef} {...provided.droppableProps}>
										{folders.map((folder, index) => (
											<Draggable
												key={folder.id}
												draggableId={folder.id}
												index={index}
											>
												{(provided, snapshot) => (
													<Tooltip
														title={` ${
															boards.filter((b) => b.folderId === folder.id)
																.length
														} Boards - ${
															boards.filter(
																(b) => b.folderId === folder.id && !b.archived
															).length
														}  Not-Archived`}
													>
														<Accordion
															ref={provided.innerRef}
															{...provided.draggableProps}
															sx={{
																display:
																	folder.archived && !isArchived.folders
																		? 'none'
																		: 'block',
															}}
														>
															<AccordionSummary
																{...provided.dragHandleProps}
																expandIcon={<ExpandMoreIcon />}
																sx={{
																	bgcolor: folder.Board.some(
																		(b) => b.id === activeBoard
																	)
																		? 'grey.800'
																		: 'grey:900',
																}}
															>
																<Typography
																	sx={{
																		whiteSpace: 'nowrap',
																		overflow: 'hidden',
																		textOverflow: 'ellipsis',
																		fontWeight: 700,
																		width: 190,
																		fontSize: '.9rem',
																	}}
																>
																	{folder.name ? folder.name : 'Untitled'}
																</Typography>
															</AccordionSummary>
															<AccordionActions
																sx={{
																	padding: '0 10px',
																	display: 'flex',
																	justifyContent: 'space-between',
																}}
															>
																<FolderTitle
																	currentTitle={folder.name}
																	folderId={folder.id}
																/>
																<Box sx={{ display: 'flex' }}>
																	<Tooltip title='Archive folder'>
																		<Checkbox
																			icon={<ArchiveOutlinedIcon />}
																			checkedIcon={<UnarchiveIcon />}
																			size='small'
																			checked={folder.archived}
																			onChange={() =>
																				handleArchiveFolder(
																					folder.id,
																					folder.archived
																				)
																			}
																		/>
																	</Tooltip>
																	<IconButton
																		onClick={() =>
																			confirm(
																				'Are you sure you want to delete the folder?'
																			) &&
																			confirm(
																				"This action will permanently delete the folder and it's contents"
																			) &&
																			folderDelete(folder.id)
																		}
																	>
																		<Tooltip title='Permanently delete folder'>
																			<FolderDeleteIcon fontSize='small' />
																		</Tooltip>
																	</IconButton>
																	<IconButton
																		onClick={() => createBoard(folder.id)}
																	>
																		<Tooltip title='Add board to current folder'>
																			<AddBoxOutlinedIcon fontSize='small' />
																		</Tooltip>
																	</IconButton>
																</Box>
															</AccordionActions>
															<AccordionDetails sx={{ padding: '5px 0' }}>
																<DragDropContext
																	onDragEnd={(dragResult) =>
																		onDragEnd(dragResult, folder.id)
																	}
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
																					?.filter(
																						(board) =>
																							board.folderId === folder.id
																					)
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
																									selected={
																										item.id === activeBoard
																									}
																									sx={{
																										display:
																											item.archived &&
																											!isArchived.boards
																												? 'none'
																												: '',
																										pl: '20px',
																										cursor: snapshot.isDragging
																											? 'grab'
																											: 'pointer!important',
																									}}
																									onClick={() =>
																										dispatch(
																											setActiveBoard(item.id)
																										)
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
													</Tooltip>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</Box>
								)}
							</Droppable>
						</DragDropContext>
					</Box>
				</List>
			</Drawer>
		</>
	);
};

export default Sidebar;

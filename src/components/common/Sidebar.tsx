import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { trpc } from '../../utils/trpc';
import { setBoards } from '../../redux/features/boardSlice';
import { setActiveBoard } from '../../redux/features/activeBoardSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
	Box,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	SwipeableDrawer,
	Typography,
} from '@mui/material';
import assets from '../../assets/assets';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import MenuIcon from '@mui/icons-material/Menu';

import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult,
} from 'react-beautiful-dnd';
import { setFavoritedBoards } from '../../redux/features/favoritedBoardsSlice';
import Favorites from './Favorites';

const Sidebar = () => {
	const { data: session } = useSession();
	const dispatch = useAppDispatch();
	const sidebarWidth = 250;

	const [sideBarOpen, setSideBarOpen] = React.useState(false);

	const boards = useAppSelector((state) => state.board.value);
	const activeBoard = useAppSelector((state) => state.activeBoard.value);
	const favoritedBoards = useAppSelector(
		(state) => state.favoritedBoards.value
	);
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

	const createBoard = async () => {
		try {
			boardMutation.mutateAsync({
				userId: String(session?.user?.id),
			});
		} catch (e) {
			console.error(e);
		}
	};

	const getBoards = async () => {
		const { data, isFetched } = await refetch();
		if (isFetched && data && data?.length > 0) {
			dispatch(setBoards(data));
			dispatch(setActiveBoard(data[0]?.id));
			dispatch(
				setFavoritedBoards(
					data
						.filter((board) => board.favorite)
						.sort((a, b) => a.favoritePosition - b.favoritePosition)
				)
			);
		}
	};

	React.useEffect(() => {
		if (boards.length < 1) {
			getBoards();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onDragEnd = async (result: DropResult) => {
		const { destination, source } = result;
		console.log(result);

		if (!destination) {
			return;
		}

		const newList = [...boards];
		const [removed] = newList.splice(source.index, 1);
		newList.splice(destination!.index, 0, removed!);

		dispatch(setBoards(newList));

		try {
			await boardPositionUpdateMutation.mutateAsync({ boards: newList });
		} catch (e) {
			console.log(e);
		}

		//
	};

	return (
		<>
			{' '}
			{window.innerWidth < 600 && (
				<IconButton
					onClick={() => setSideBarOpen(true)}
					sx={{ position: 'absolute', bottom: '5px', right: '5px' }}
				>
					<MenuIcon />
				</IconButton>
			)}
			<SwipeableDrawer
				container={window.document.body}
				open={sideBarOpen}
				variant={window.innerWidth < 1000 ? 'temporary' : 'permanent'}
				onOpen={() => setSideBarOpen(true)}
				anchor={window.innerWidth < 1000 ? 'right' : 'left'}
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

					<Favorites />

					<Box sx={{ pt: '10px' }}>
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
								<IconButton onClick={() => createBoard()}>
									<AddBoxOutlinedIcon fontSize='small' />
								</IconButton>
							</Box>
						</ListItem>
						<DragDropContext onDragEnd={onDragEnd}>
							<Droppable
								key={'list-board-droppable-key'}
								droppableId={'list-board-droppable'}
							>
								{(provided) => (
									<div ref={provided.innerRef} {...provided.droppableProps}>
										{boards?.map((item, index) => (
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
														onClick={() => dispatch(setActiveBoard(item.id))}
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
					</Box>
				</List>
			</SwipeableDrawer>
		</>
	);
};

export default Sidebar;

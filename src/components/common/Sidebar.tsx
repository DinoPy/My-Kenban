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
	Typography,
} from '@mui/material';
import assets from '../../assets/assets';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Link from 'next/link';

const Sidebar = () => {
	const { data: session } = useSession();
	const dispatch = useAppDispatch();

	const sidebarWidth = 250;
	const boards = useAppSelector((state) => state.board.value);
	const activeBoard = useAppSelector((state) => state.activeBoard.value);

	const getBoards = async () => {
		const { data } = trpc.board.getAll.useQuery({
			userId: String(session?.user?.id),
		});
		dispatch(setBoards(data));
	};
	getBoards();

	const ctx = trpc.useContext();
	const boardMutation = trpc.board.create.useMutation({
		onSuccess(data) {
			ctx.board.getAll.invalidate();
			dispatch(setBoards(data));
			dispatch(setActiveBoard(data.id));
		},
	});

	const createBoard = () => {
		try {
			boardMutation.mutateAsync({
				userId: String(session?.user?.id),
			});
		} catch (e) {
			console.error(e);
		}
	};

	React.useEffect(() => {
		if (boards?.length > 0) {
			dispatch(setActiveBoard(boards[0]?.id));
		}
	}, []);

	const onDragEnd = () => {
		//
	};

	return (
		<Drawer
			container={window.document.body}
			variant='permanent'
			open={true}
			sx={{
				width: sidebarWidth,
				height: '100vh',
				border: '1px solid yellow',
				'& > div': {
					borderRight: 'none',
				},
			}}
		>
			<List
				disablePadding
				sx={{
					width: sidebarWidth,
					height: '100vh',
					backgroundColor: assets.colors.secondary,
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
								Favorites
							</Typography>
						</Box>
					</ListItem>
				</Box>

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
								</div>
							)}
						</Droppable>
					</DragDropContext>
				</Box>
			</List>
		</Drawer>
	);
};

export default Sidebar;

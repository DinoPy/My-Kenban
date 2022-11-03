import React from 'react';
import { trpc } from '../../utils/trpc';
import { setActiveBoard } from '../../redux/features/activeBoardSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { Box, ListItem, ListItemButton, Typography } from '@mui/material';

import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult,
} from 'react-beautiful-dnd';
import { setFavoritedBoards } from '../../redux/features/favoritedBoardsSlice';

const Favorites = () => {
	const dispatch = useAppDispatch();
	const favoritedBoards = useAppSelector(
		(state) => state.favoritedBoards.value
	);

	const boardFavPosUpdate = trpc.board.updateFavoritePositon.useMutation();

	const activeBoard = useAppSelector((state) => state.activeBoard.value);

	const onDragEnd = async (result: DropResult) => {
		const { destination, source } = result;

		if (!destination) {
			return;
		}
		if (
			destination.droppableId === source.droppableId &&
			source.index === destination.index
		)
			return;

		const newList = [...favoritedBoards];
		const [removed] = newList.splice(source.index, 1);
		newList.splice(destination!.index, 0, removed!);

		dispatch(setFavoritedBoards(newList));

		try {
			await boardFavPosUpdate.mutateAsync({ boards: newList });
		} catch (e) {
			alert(e);
		}

		//
	};

	return (
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
			{favoritedBoards.length > 0 && (
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable
						key={'list-board-droppable-key'}
						droppableId={'list-board-droppable'}
					>
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps}>
								{favoritedBoards.map((item, index) => (
									<Draggable key={item.id} draggableId={item.id} index={index}>
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
			)}
		</Box>
	);
};

export default Favorites;

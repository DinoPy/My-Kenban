import { Card, Typography } from '@mui/material';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useAppSelector } from '../../redux/hooks';
import { TaskInterface } from './Kanban';

const Tasks = ({
	task,
	index,
	sectionId,
	setSelectedTask,
}: {
	task: TaskInterface;
	index: number;
	sectionId: string;
	setSelectedTask: (task: TaskInterface) => void;
}) => {
	const isArchived = useAppSelector((state) => state.archived.value);
	return (
		<Draggable key={task.id} draggableId={task.id} index={index}>
			{(provided, snapshot) => (
				<Card
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					sx={{
						padding: '10px',
						marginBottom: '10px',
						cursor: snapshot.isDragging ? 'grab' : 'pointer!important',
						display: task.archived && !isArchived.tasks ? 'none' : '',
					}}
					onClick={() =>
						setSelectedTask({
							...task,
							sectionId,
						})
					}
				>
					<Typography>{task.title === '' ? 'Untitled' : task.title}</Typography>
				</Card>
			)}
		</Draggable>
	);
};

export default Tasks;

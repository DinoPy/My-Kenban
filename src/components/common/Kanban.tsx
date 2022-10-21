import React from 'react';
import {
	Box,
	Button,
	Card,
	Divider,
	IconButton,
	TextField,
	Typography,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/Add';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { useAppSelector } from '../../redux/hooks';
import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult,
} from 'react-beautiful-dnd';
import { trpc } from '../../utils/trpc';
import TaskModal from './TaskModal';

let timer: NodeJS.Timeout;
const cooldown = 500;

export interface SectionInterface {
	sections:
		| {
				title: string;
				id: string;
				task: {
					id: string;
					title: string;
					content: string;
					position: number;
					createdAt: Date;
				}[];
		  }[]
		| [];
}

export interface TaskInterface {
	id: string;
	title: string;
	content: string;
	position: number;
	createdAt: Date;
	sectionId?: string;
}

const Kanban = (props: SectionInterface) => {
	const [sections, setSections] = React.useState<SectionInterface['sections']>(
		props.sections
	);
	const [selectedTask, setSelectedTask] = React.useState<
		TaskInterface | undefined
	>(undefined);

	const activeBoard = useAppSelector((state) => state.activeBoard.value);

	const addSectionMutation = trpc.section.create.useMutation();
	const removeSectionMutation = trpc.section.delete.useMutation();
	const updateSectionMutation = trpc.section.update.useMutation();

	const addTaskMutation = trpc.task.create.useMutation();
	const updateTaskPositionMutation = trpc.task.updatePosition.useMutation();

	React.useEffect(() => {
		setSections(props.sections);
	}, [props.sections]);

	//-------------------------------------SECTION-------------------------------------//
	const handleAddSection = async () => {
		///
		try {
			const newSection = await addSectionMutation.mutateAsync({
				boardId: activeBoard,
			});
			setSections((prev) => [...prev, newSection]);
		} catch (e) {
			console.log(e);
		}
	};

	const handleDeleteSection = async (id: string) => {
		const removedSEction = await removeSectionMutation.mutateAsync({
			id,
		});
		setSections((prev) => prev.filter((s) => s.id !== removedSEction.id));
	};

	const handleEditSection = async (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		id: string
	) => {
		clearTimeout(timer);
		const value = e.target.value;

		setSections((prev) =>
			prev.map((s) => {
				if (s.id === id) {
					s.title = value;
				}
				return s;
			})
		);
		try {
			timer = setTimeout(async () => {
				await updateSectionMutation.mutateAsync({
					id,
					title: value,
				});
			}, cooldown);
		} catch (error) {
			console.log(error);
		}
	};

	//-------------------------------------TASK-------------------------------------//

	const handleCreateTask = async (sectionId: string) => {
		///
		try {
			const newTask = await addTaskMutation.mutateAsync({
				sectionId,
			});
			setSections((prev) =>
				prev.map((t) => {
					if (t.id === sectionId) {
						t.task.unshift(newTask);
					}
					return t;
				})
			);
		} catch (e) {
			console.log(e);
		}
	};

	const onDragEnd = async (result: DropResult) => {
		const { source, destination } = result;
		if (!destination) return;

		const sourceSectionIndex = sections.findIndex(
			(s) => s.id === source.droppableId
		);
		const destinationSectionIndex = sections.findIndex(
			(s) => s.id === destination.droppableId
		);
		const sourceCol = sections[sourceSectionIndex];
		const destCol = sections[destinationSectionIndex];

		if (sourceCol?.task && destCol?.task) {
			const sourceItems = [...sourceCol.task];
			const destItems = [...destCol.task];

			const copy = [...sections];

			if (source.droppableId !== destination.droppableId) {
				const [removed] = sourceItems.splice(source.index, 1);
				if (removed) {
					destItems.splice(destination.index, 0, removed);
				}

				copy[sourceSectionIndex] = {
					...sourceCol,
					task: sourceItems,
				};

				copy[destinationSectionIndex] = {
					...destCol,
					task: destItems,
				};
			} else {
				const [removed] = sourceItems.splice(source.index, 1);
				if (removed) {
					sourceItems.splice(destination.index, 0, removed);
				}

				copy[sourceSectionIndex] = {
					...sourceCol,
					task: sourceItems,
				};
			}

			setSections(copy);
			try {
				await updateTaskPositionMutation.mutateAsync({
					resourceSectionId: source.droppableId,
					destinationSectionId: destination.droppableId,
					destinationList: destItems,
					resourceList: sourceItems,
				});
			} catch (e) {
				console.log(e);
			}
		}
	};

	const taskUpdateHandler = async (task: TaskInterface) => {
		const { sectionId, ...rest } = task;
		const newData = [...sections];
		// crazy checking due to compiled version crashing on undefined section in the find index
		if (sectionId && newData !== undefined) {
			const sectionIndex = newData.findIndex(
				(section) => section.id === sectionId
			);
			const taskIndex = newData[sectionIndex]?.task.findIndex(
				(t) => t.id === task.id
			);
			if (taskIndex !== undefined && sectionIndex !== undefined) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				newData.at(sectionIndex)!.task[taskIndex] = rest;
			}
			setSections(newData);
		}
	};

	const taskDeleteHandler = async (task: TaskInterface) => {
		const { sectionId, ...rest } = task;
		const newData = [...sections];
		if (sectionId && newData !== undefined) {
			const sectionIndex = newData.findIndex((s) => s.id === sectionId);
			const taskIndex = newData[sectionIndex]?.task.findIndex(
				(t) => t.id === rest.id
			);
			if (!newData) return;
			if (sectionIndex !== undefined && taskIndex !== undefined) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				newData[sectionIndex]!.task.splice(taskIndex, 1);
			}
			setSections(newData);
		}
	};

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
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<Button onClick={handleAddSection}>Add section</Button>
				<Typography variant='body2' fontWeight={700}>
					{' '}
					{sections.length} sections
				</Typography>
			</Box>
			<Divider sx={{ margin: '10px 0' }} />
			<DragDropContext onDragEnd={onDragEnd}>
				<Box
					sx={{
						display: 'flex',
						overflowX: 'auto',
						alignItems: 'flex-start',
						width: dimensions.width < 1000 ? '100%' : 'calc(100vw - 400px)',
					}}
				>
					{sections.map((section) => (
						<div key={section.id} style={{ width: '300px' }}>
							<Droppable key={section.id} droppableId={section.id}>
								{(provided) => (
									<Box
										ref={provided.innerRef}
										{...provided.droppableProps}
										sx={{
											width: `${dimensions.width < 600 ? '200px' : '300px'}`,
											padding: '10px',
											marginRight: '10px',
										}}
									>
										<Box
											sx={{
												display: 'flex',
												alignItem: 'center',
												justifyContent: 'space-between',
												marginBottom: '10px',
											}}
										>
											<TextField
												value={section.title}
												onChange={(e) => handleEditSection(e, section.id)}
												placeholder='Untitled'
												variant='outlined'
												sx={{
													flexGrow: 1,
													'& .MuiOutlinedInput-input': { padding: 0 },
													'& .MuiOutlinedInput-root': {
														fontSize: '1rem',
														fontWeight: 700,
													},
													'& .MuiOutlinedInput-notchedOutline': {
														border: 'unset',
													},
												}}
											/>
											<IconButton
												size='small'
												sx={{ color: 'gray', '&:hover': { color: 'green' } }}
												onClick={() => handleCreateTask(section.id)}
											>
												<AddOutlinedIcon />
											</IconButton>
											<IconButton
												size='small'
												sx={{ color: 'gray', '&:hover': { color: 'red' } }}
												onClick={() =>
													window.confirm(
														'Are you sure you want to permanenly delete this section?'
													) && handleDeleteSection(section.id)
												}
											>
												<DeleteForever />
											</IconButton>
										</Box>
										{/* tasks */}
										{section.task.map((task, index) => (
											<Draggable
												key={task.id}
												draggableId={task.id}
												index={index}
											>
												{(provided, snapshot) => (
													<Card
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														sx={{
															padding: '10px',
															marginBottom: '10px',
															cursor: snapshot.isDragging
																? 'grab'
																: 'pointer!important',
														}}
														onClick={() =>
															setSelectedTask({
																...task,
																sectionId: section.id,
															})
														}
													>
														<Typography>
															{task.title === '' ? 'Untitled' : task.title}
														</Typography>
													</Card>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</Box>
								)}
							</Droppable>
						</div>
					))}
				</Box>
			</DragDropContext>
			{selectedTask && (
				<TaskModal
					task={selectedTask}
					boardId={activeBoard}
					onClose={() => setSelectedTask(undefined)}
					onUpdate={taskUpdateHandler}
					onDelete={taskDeleteHandler}
					dimensions={dimensions}
				/>
			)}
		</>
	);
};

export default Kanban;

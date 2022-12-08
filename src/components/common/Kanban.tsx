import React from 'react';
import {
	Box,
	Button,
	Card,
	Checkbox,
	CircularProgress,
	Divider,
	IconButton,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/Add';
import DeleteForever from '@mui/icons-material/DeleteForever';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { useAppSelector } from '../../redux/hooks';
import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult,
} from 'react-beautiful-dnd';
import { trpc } from '../../utils/trpc';
import TaskModal from './TaskModal';
import Tasks from './Tasks';
import Loading from './Loading';
import { LoadingButton } from '@mui/lab';

let timer: NodeJS.Timeout;
const cooldown = 500;

export interface TaskInterface {
	id: string;
	title: string;
	content: string;
	position: number;
	createdAt: Date;
	sectionId?: string;
	archived: boolean;
}

export interface SectionInterface {
	sections:
		| {
				title: string;
				id: string;
				position: number;
				archived: boolean;
				task: TaskInterface[];
		  }[]
		| [];
}

const Kanban = (props: SectionInterface) => {
	const [sections, setSections] = React.useState<SectionInterface['sections']>(
		props.sections
	);
	const [selectedTask, setSelectedTask] = React.useState<
		TaskInterface | undefined
	>(undefined);

	const activeBoard = useAppSelector((state) => state.activeBoard.value);
	const isArchived = useAppSelector((state) => state.archived.value);

	const addSectionMutation = trpc.section.create.useMutation();
	const removeSectionMutation = trpc.section.delete.useMutation();
	const updateSectionMutation = trpc.section.update.useMutation();
	const updateSectionPositionMutation =
		trpc.section.positonUpdate.useMutation();
	const toggleSectionArchiveMutation =
		trpc.section.archiveSection.useMutation();

	const addTaskMutation = trpc.task.create.useMutation();
	const updateTaskPositionMutation = trpc.task.updatePosition.useMutation();
	const toggleTaskArchiveMutation = trpc.task.toggleArchived.useMutation();

	const [isLoading, setIsLoading] = React.useState(false);

	React.useEffect(() => {
		setSections(props.sections);
	}, [props.sections]);

	React.useEffect(() => {
		if (selectedTask === undefined) {
			window.document.body.style.overflowY = 'auto';
		} else {
			window.document.body.scrollIntoView();
			window.document.body.style.overflowY = 'hidden';
		}
	}, [selectedTask]);

	//-------------------------------------SECTION-------------------------------------//
	const handleAddSection = async () => {
		///

		setIsLoading(true);
		try {
			const newSection = await addSectionMutation.mutateAsync({
				boardId: activeBoard,
			});
			setSections((prev) => [...prev, newSection]);
		} catch (e) {
			console.log(e);
		}

		setIsLoading(false);
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

	const handleArchiveSection = async (sectionId: string, archived: boolean) => {
		setSections((prev) =>
			prev.map((s) =>
				s.id === sectionId ? { ...s, archived: !s.archived } : s
			)
		);

		try {
			await toggleSectionArchiveMutation.mutateAsync({ sectionId, archived });
		} catch (e) {
			console.log(e);
		}
	};

	//-------------------------------------TASK-------------------------------------//

	const handleCreateTask = async (sectionId: string) => {
		///
		setIsLoading(true);
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
			setIsLoading(false);
		} catch (e) {
			console.log(e);
		}
	};

	const onDragEnd = async (result: DropResult) => {
		const { source, destination, type } = result;
		if (!destination) return;
		if (
			destination.droppableId === source.droppableId &&
			source.index === destination.index
		)
			return;

		switch (type) {
			case 'SECTIONS': {
				const copySection = Array.from(sections);
				const removed = copySection.splice(source.index, 1);
				copySection.splice(destination.index, 0, ...removed);
				setSections(copySection);

				try {
					const response = await updateSectionPositionMutation.mutateAsync(
						copySection
					);
				} catch (e) {
					console.log(e);
				}
				break;
			}
			case 'TASKS': {
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
					} else {
						const [removed] = sourceItems.splice(source.index, 1);
						if (removed) {
							sourceItems.splice(destination.index, 0, removed);
						}

						copy[sourceSectionIndex] = {
							...sourceCol,
							task: sourceItems,
						};
						setSections(copy);
						try {
							await updateTaskPositionMutation.mutateAsync({
								resourceSectionId: source.droppableId,
								destinationSectionId: destination.droppableId,
								destinationList: sourceItems,
								resourceList: destItems,
							});
						} catch (e) {
							console.log(e);
						}
					}
				}
				break;
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

	const toggleArchiveTask = async (
		taskId: string,
		sectionId: string,
		prevState: boolean
	) => {
		////

		setSections((prev) =>
			prev.map((s) => {
				const newSections =
					s.id !== sectionId
						? s
						: {
								...s,
								task: s.task.map((t) =>
									t.id !== taskId ? t : { ...t, archived: !t.archived }
								),
						  };
				return newSections;
			})
		);

		try {
			await toggleTaskArchiveMutation.mutateAsync({ taskId, prevState });
		} catch (e) {
			console.log(e);
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
	}, []);

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<LoadingButton onClick={handleAddSection} loading={isLoading}>
					Add section
				</LoadingButton>
				<Typography variant='body2' fontWeight={700}>
					{' '}
					{sections.length} Sections -{' '}
					{
						(isArchived.sections
							? sections
							: sections.filter((s) => !s.archived)
						).length
					}{' '}
					Not-Archived
				</Typography>
			</Box>
			<Divider sx={{ margin: '10px 0' }} />
			<DragDropContext onDragEnd={onDragEnd}>
				<Droppable
					droppableId='column-reorder'
					direction='horizontal'
					type='SECTIONS'
				>
					{(provided, shapshot) => (
						<Box
							ref={provided.innerRef}
							{...provided.droppableProps}
							sx={{
								display: 'flex',
								overflowX: 'auto',
								minHeight: '100%',
								alignItems: 'flex-start',
								width: dimensions.width < 1000 ? '100%' : 'calc(100vw - 400px)',
							}}
						>
							{sections.map((section, sectionIndex) => (
								<Draggable
									draggableId={section.id}
									index={sectionIndex}
									key={section.id}
								>
									{(prov, snapshot) => (
										<div
											key={section.id}
											style={{ width: '300px' }}
											ref={prov.innerRef}
											{...prov.draggableProps}
										>
											<Droppable
												key={section.id}
												droppableId={section.id}
												type='TASKS'
											>
												{(provided) => (
													<Box
														ref={provided.innerRef}
														{...provided.droppableProps}
														sx={{
															display:
																section.archived && !isArchived.sections
																	? 'none'
																	: '',
															width: `${
																dimensions.width < 600 ? '230px' : '300px'
															}`,
															padding: '10px',
															marginRight: '10px',
														}}
													>
														<Box
															sx={{
																display: 'flex',
																alignItem: 'center',
																justifyContent: 'center',
																marginBottom: '10px',
															}}
														>
															<Tooltip title='Drag section'>
																<Box
																	{...prov.dragHandleProps}
																	sx={{ display: 'flex', alignItems: 'center' }}
																>
																	<DragHandleIcon color='action' />
																</Box>
															</Tooltip>

															<Tooltip title='Rename Section'>
																<TextField
																	value={section.title}
																	onChange={(e) =>
																		handleEditSection(e, section.id)
																	}
																	placeholder='Untitled'
																	variant='outlined'
																	sx={{
																		paddingTop: '7px',
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
															</Tooltip>
															<Tooltip title='Archive board'>
																<IconButton
																	// checked={section.archived}
																	onClick={() =>
																		handleArchiveSection(
																			section.id,
																			section.archived
																		)
																	}
																>
																	{section.archived ? (
																		<UnarchiveIcon
																			fontSize='small'
																			color='success'
																		/>
																	) : (
																		<ArchiveOutlinedIcon
																			fontSize='small'
																			color='info'
																		/>
																	)}
																</IconButton>
															</Tooltip>

															<Tooltip title='Add task'>
																<IconButton
																	sx={{
																		// color: 'gray',
																		'&:hover': { color: 'green' },
																	}}
																	onClick={() => handleCreateTask(section.id)}
																	disabled={isLoading}
																>
																	<AddOutlinedIcon fontSize='small' />
																</IconButton>
															</Tooltip>

															<Tooltip title='Delete section'>
																<IconButton
																	sx={{
																		// color: 'gray',
																		'&:hover': { color: 'red' },
																	}}
																	onClick={() =>
																		window.confirm(
																			'Are you sure you want to permanenly delete this section?'
																		) && handleDeleteSection(section.id)
																	}
																>
																	<DeleteForever fontSize='small' />
																</IconButton>
															</Tooltip>
														</Box>
														{/* tasks */}
														{section.task.map((task, index) => (
															<Tasks
																key={task.id}
																task={task}
																index={index}
																sectionId={section.id}
																setSelectedTask={setSelectedTask}
															/>
														))}
														{provided.placeholder}
													</Box>
												)}
											</Droppable>
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</Box>
					)}
				</Droppable>
			</DragDropContext>
			{selectedTask && (
				<TaskModal
					task={selectedTask}
					boardId={activeBoard}
					onClose={() => setSelectedTask(undefined)}
					onUpdate={taskUpdateHandler}
					onDelete={taskDeleteHandler}
					dimensions={dimensions}
					toggleArchiveTask={toggleArchiveTask}
				/>
			)}
		</>
	);
};

export default Kanban;

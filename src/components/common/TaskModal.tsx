import DeleteForever from '@mui/icons-material/DeleteForever';
import CloseIcon from '@mui/icons-material/Close';
import {
	Backdrop,
	Box,
	Divider,
	Fade,
	FormControlLabel,
	IconButton,
	Modal,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import Moment from 'moment';
import { TaskInterface } from './Kanban';
import { trpc } from '../../utils/trpc';
import dynamic from 'next/dynamic';

const CKEditor = dynamic(() => import('./CKEditor'), { ssr: false });

export interface TaskModalInterface {
	task: TaskInterface | undefined;
	boardId: string;
	onClose: () => void;
	onUpdate: (task: TaskInterface) => void;
	onDelete: (task: TaskInterface) => void;
	dimensions: { height: number; width: number };
}

const modalStyle = {
	outline: 'none',
	position: 'absolute',
	top: '50%',
	left: '50%',
	width: '50%',
	transform: 'translate(-50%, -50%)',
	bgcolor: 'background.paper',
	border: '0px solid #000',
	boxShadow: 24,
	p: 1,
	height: '80%',
};

const maximizedModalStyle = {
	bgcolor: 'background.paper',
	position: 'absolute',
	height: '96%',
	boxShadow: 24,
	width: `min(90vw, 1800px)`,
	border: '2`min(100vw, 1800px)`px solid #000',
	padding: '1em',
};

let timer: NodeJS.Timeout;
const timeout = 500;

const TaskModal = (props: TaskModalInterface) => {
	const taskDeleteMutation = trpc.task.delete.useMutation();
	const taskUpdateMutation = trpc.task.update.useMutation();

	const [isTaskModalMaximized, setIsTaskModalMaximized] =
		React.useState<boolean>(props.dimensions.width < 600 ? true : false);

	const [task, setTask] = React.useState<TaskInterface | undefined>(props.task);
	const [isDeleting, setIsDeleting] = React.useState(false);
	const [title, setTitle] = React.useState<string>(props.task?.title || '');
	const [content, setContent] = React.useState<string>(
		props.task?.content || ''
	);

	useEffect(() => {
		setTask(props.task);
		setTitle(props.task !== undefined ? props.task.title : '');
		setContent(props.task !== undefined ? props.task.content : '');
	}, [props.task]);

	const onClose = () => {
		if (task !== undefined) {
			props.onUpdate({ ...task, title, content });
		}
		props.onClose();
	};

	const onDeleteTask = async () => {
		setIsDeleting(true);
		try {
			if (task !== undefined) {
				await taskDeleteMutation.mutateAsync({
					id: task.id,
				});
			}
			setTask(undefined);
			props.onDelete(task as TaskInterface);
			setTimeout(() => {
				setIsDeleting(false);
			}, 200);
		} catch (e) {
			console.log(e);
		}
	};

	const onUpdateTitle = async (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		clearTimeout(timer);
		const { value } = e.target;
		setTitle(value);

		if (task !== undefined) {
			timer = setTimeout(async () => {
				await taskUpdateMutation.mutateAsync({
					id: task?.id,
					title: value,
					content: content,
				});
			}, timeout);
			props.onUpdate({ ...task, title: value });
		}
	};

	const onUpdateContent = async (e: any, editor: any) => {
		clearTimeout(timer);
		const data = editor.getData();
		setContent(data);

		try {
			if (task !== undefined) {
				timer = setTimeout(async () => {
					await taskUpdateMutation.mutateAsync({
						id: task?.id,
						title: title,
						content: data,
					});
				}, timeout);

				console.log(task);
				props.onUpdate({ ...task, content: data });
			}
		} catch (e) {
			console.log(e);
		}
	};

	const width = `${
		props.dimensions.width >= 1800
			? `${(props.dimensions.width - 1800) / 2}px`
			: '5%'
	}`;

	console.log(isTaskModalMaximized);

	return (
		<Modal
			open={task !== undefined}
			closeAfterTransition
			BackdropComponent={Backdrop}
			BackdropProps={{ timeout: 500 }}
			onClose={() => onClose()}
		>
			<Fade in={task !== undefined}>
				<Box
					sx={
						isTaskModalMaximized
							? {
									...maximizedModalStyle,
									transform: `translate(calc(${width}	), 3%)`,
							  }
							: modalStyle
					}
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-end',
							width: '100%',
						}}
					>
						<Box>
							{props.dimensions.width > 600 && (
								<FormControlLabel
									control={
										<Switch
											value={isTaskModalMaximized}
											onChange={() => setIsTaskModalMaximized((prev) => !prev)}
											defaultChecked={isTaskModalMaximized}
										/>
									}
									label='Maximize'
									labelPlacement='start'
									sx={{ marginRight: '1em' }}
								/>
							)}
							<IconButton
								color='error'
								onClick={() =>
									window.confirm(
										'Are you sure you want to permanenly delete this task?'
									) && onDeleteTask()
								}
								disabled={isDeleting}
							>
								<DeleteForever />
							</IconButton>
						</Box>
						<Box sx={{ justifySelf: 'flex-start' }}>
							<IconButton onClick={() => onClose()}>
								<CloseIcon />
							</IconButton>
						</Box>
					</Box>

					<Box
						sx={{
							display: 'flex',
							height: '100%',
							flexDirection: 'column',
							padding: isTaskModalMaximized
								? '0rem .5rem 3rem'
								: '2rem 3rem 3rem',
						}}
					>
						<TextField
							value={title}
							onChange={(e) => onUpdateTitle(e)}
							placeholder='Untitled'
							variant='outlined'
							sx={{
								width: '100%',
								'& .MuiOutlinedInput-input': { padding: 0 },
								'& .MuiOutlinedInput-root': {
									fontSize: '2.5rem',
									fontWeight: 700,
								},
								'& .MuiOutlinedInput-notchedOutline': {
									border: 'unset',
								},
								marginBottom: '10px',
							}}
						/>
						<Typography variant='body2' fontWeight='700'>
							{task !== undefined
								? Moment(task.createdAt).format('DD/MM/YYYY')
								: ''}
						</Typography>
						<Divider sx={{ my: 3 }} />
						<Box
							sx={{
								height: '100%',
								border: '1px #252525 solid',
								overflowX: 'hidden',
								overflowY: 'hidden',
							}}
						>
							<CKEditor content={content} onUpdateContent={onUpdateContent} />
						</Box>
					</Box>
				</Box>
			</Fade>
		</Modal>
	);
};

export default TaskModal;

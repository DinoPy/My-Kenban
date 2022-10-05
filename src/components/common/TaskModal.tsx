import DeleteForever from '@mui/icons-material/DeleteForever';
import {
	Backdrop,
	Box,
	Divider,
	Fade,
	IconButton,
	Modal,
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

let timer: NodeJS.Timeout;
const timeout = 500;

const TaskModal = (props: TaskModalInterface) => {
	const boardId = props.boardId;
	const taskDeleteMutation = trpc.task.delete.useMutation();
	const taskUpdateMutation = trpc.task.update.useMutation();

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
			console.log(task);
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

				props.onUpdate({ ...task, content: data });
				console.log(task);
			}
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<Modal
			open={task !== undefined}
			closeAfterTransition
			BackdropComponent={Backdrop}
			BackdropProps={{ timeout: 500 }}
			onClose={() => onClose()}
		>
			<Fade in={task !== undefined}>
				<Box sx={modalStyle}>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-end',
							width: '100%',
						}}
					>
						<IconButton
							color='error'
							onClick={onDeleteTask}
							disabled={isDeleting}
						>
							<DeleteForever />
						</IconButton>
					</Box>

					<Box
						sx={{
							display: 'flex',
							height: '100%',
							flexDirection: 'column',
							padding: '2rem 5rem 5rem',
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
						<Divider sx={{ my: 5 }} />
						<Box
							sx={{ height: '80%', overflowX: 'hidden', overflowY: 'hidden' }}
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

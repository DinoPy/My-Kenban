import DeleteForever from '@mui/icons-material/DeleteForever';
import CloseIcon from '@mui/icons-material/Close';
import {
	Box,
	Checkbox,
	Divider,
	Fade,
	IconButton,
	Switch,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
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
	toggleArchiveTask: (
		taskId: string,
		sectionId: string,
		prevState: boolean
	) => void;
}

const modalStyle = {
	outline: 'none',
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: '100%',
	height: '100%',
	backgroundColor: 'rgba(2,2,2,.5)',
	// border: '0px solid #000',
	boxShadow: 24,
	p: 1,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

const notMaximizedStyle = {
	width: '70%',
	height: '80%',
	bgcolor: 'background.paper',
	p: 1,
};
const maximizedModalStyle = {
	height: '96%',
	// width: `min(90vw, 1800px)`,
	width: '96%',
	bgcolor: 'background.paper',
	p: 1,
};

let timer: NodeJS.Timeout;
const timeout = 1500;

const TaskModal = (props: TaskModalInterface) => {
	const taskDeleteMutation = trpc.task.delete.useMutation();
	const taskUpdateMutation = trpc.task.update.useMutation();

	const [isTaskModalMaximized, setIsTaskModalMaximized] =
		React.useState<boolean>(props.dimensions.width < 1200 ? true : false);

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
			console.log(title);
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
				props.onUpdate({ ...task, content: data, title: title });
				timer = setTimeout(async () => {
					await taskUpdateMutation.mutateAsync({
						id: task?.id,
						title: title,
						content: data,
					});
				}, timeout);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleArchiveToggle = (prevState: boolean | undefined) => {
		if (task) setTask({ ...task, archived: !task?.archived });

		if (props.task && props.task.id && props.task.sectionId) {
			if (typeof prevState === 'boolean')
				props.toggleArchiveTask(props.task.id, props.task.sectionId, prevState);
		}
	};

	return (
		<div
			onKeyDown={(e) => {
				if (e.key === 'Escape') onClose();
			}}

			// open={task !== undefined}
			// closeAfterTransition
			// BackdropComponent={Backdrop}
			// BackdropProps={{ timeout: 500 }}
			// onClose={() => onClose()}
		>
			<Fade in={task !== undefined}>
				<Box sx={modalStyle}>
					<Box
						sx={
							isTaskModalMaximized
								? {
										...maximizedModalStyle,
										// transform: `translate(calc(${width}	), 3%)`,
								  }
								: { ...notMaximizedStyle }
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
									<Tooltip title='Toggle maximised window'>
										<Switch
											value={isTaskModalMaximized}
											onChange={() => setIsTaskModalMaximized((prev) => !prev)}
											defaultChecked={isTaskModalMaximized}
										/>
									</Tooltip>
								)}

								<Tooltip title='Archive board'>
									<Checkbox
										icon={<ArchiveOutlinedIcon color='info' />}
										checkedIcon={<UnarchiveIcon color='success' />}
										checked={task?.archived}
										onChange={() => handleArchiveToggle(task?.archived)}
									/>
								</Tooltip>

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
									: '1em 1em 3em',
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
									overflow: 'hidden',
								}}
							>
								<CKEditor content={content} onUpdateContent={onUpdateContent} />
							</Box>
						</Box>
					</Box>
				</Box>
			</Fade>
		</div>
	);
};

export default TaskModal;

import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import { Box, Checkbox, Tooltip, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setArchived } from '../../redux/features/archivedSlice';

///
// import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
// import UnarchiveIcon from '@mui/icons-material/Unarchive';
// icon={<ArchiveOutlinedIcon />}
// checkedIcon={<UnarchiveIcon />}

///
export default function BasicMenu() {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const toggledArchived = useAppSelector((state) => state.archived.value);
	const dispatch = useAppDispatch();

	const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		////
		dispatch(
			setArchived({ ...toggledArchived, [e.target.name]: e.target.checked })
		);
	};

	return (
		<div>
			<Tooltip title='Toggle archived'>
				<Button
					id='basic-button'
					aria-controls={open ? 'basic-menu' : undefined}
					aria-haspopup='true'
					aria-expanded={open ? 'true' : undefined}
					onClick={handleClick}
				>
					Archived
				</Button>
			</Tooltip>
			<Menu
				id='basic-menu'
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
			>
				<Box sx={{ px: 2 }}>
					<Stack
						sx={{ width: '100%' }}
						direction={'row'}
						gap={3}
						justifyContent='space-between'
						alignItems='center'
					>
						<Typography variant='body1'>Folders</Typography>
						<Checkbox
							name='folders'
							checked={toggledArchived['folders']}
							onChange={(e) => {
								handleToggle(e);
							}}
						/>
					</Stack>
					<Stack
						sx={{ width: '100%' }}
						direction={'row'}
						gap={3}
						justifyContent='space-between'
						alignItems='center'
					>
						<Typography variant='body1'>Boards</Typography>
						<Checkbox
							name='boards'
							checked={toggledArchived['boards']}
							onChange={(e) => {
								handleToggle(e);
							}}
						/>
					</Stack>
					<Stack
						sx={{ width: '100%' }}
						direction={'row'}
						gap={3}
						justifyContent='space-between'
						alignItems='center'
					>
						<Typography variant='body1'>Sections</Typography>
						<Checkbox
							name='sections'
							checked={toggledArchived['sections']}
							onChange={(e) => {
								handleToggle(e);
							}}
						/>
					</Stack>
					<Stack
						sx={{ width: '100%' }}
						direction={'row'}
						gap={3}
						justifyContent='space-between'
						alignItems='center'
					>
						<Typography variant='body1'>Tasks</Typography>
						<Checkbox
							name='tasks'
							checked={toggledArchived['tasks']}
							onChange={(e) => {
								handleToggle(e);
							}}
						/>
					</Stack>
				</Box>
			</Menu>
		</div>
	);
}

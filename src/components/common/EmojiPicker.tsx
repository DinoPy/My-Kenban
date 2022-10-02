import { Box, Typography } from '@mui/material';
import React from 'react';
import { Picker, EmojiData } from 'emoji-mart';

import 'emoji-mart/css/emoji-mart.css';

const EmojiPicker = (props: {
	icon: string;
	onChange: (emoji: string) => void;
}) => {
	const [selectedEmoji, setSelectedEmoji] = React.useState(props.icon);
	const [showPicker, setShowPicker] = React.useState(false);

	React.useEffect(() => {
		setSelectedEmoji(props.icon);
	}, [props.icon]);

	const selectEmoji = (e: EmojiData) => {
		if ('unified' in e) {
			const sym: string[] = e.unified.split('-');
			const codesArray: string[] = [];
			sym.forEach((el: string) => codesArray.push('0x' + el));
			const emoji = String.fromCodePoint(...(codesArray as any));

			//
			setShowPicker(false);
			props.onChange(emoji);
		}
	};

	return (
		<Box sx={{ position: 'relative', width: 'max-content' }}>
			<Typography
				variant='h3'
				fontWeight={700}
				sx={{ cursor: 'pointer' }}
				onClick={() => setShowPicker((prev) => !prev)}
			>
				{selectedEmoji}
			</Typography>

			<Box
				sx={{
					display: showPicker ? 'block' : 'none',
					position: 'absolute',
					top: '100%',
					zIndex: '9999',
				}}
			>
				<Picker theme='dark' onSelect={selectEmoji} showPreview={false} />
			</Box>
		</Box>
	);
};

export default EmojiPicker;

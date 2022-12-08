import { createSlice } from '@reduxjs/toolkit';

// const savedBoard = localStorage.getItem('activeBoard') || '';

const initialState = { value: '' };

export const activeBoardSlice = createSlice({
	name: 'activeBoardSlice',
	initialState,
	reducers: {
		setActiveBoard: (state, action) => {
			localStorage.setItem('activeBoard', action.payload);
			state.value = action.payload;
		},
	},
});

export const { setActiveBoard } = activeBoardSlice.actions;

export default activeBoardSlice.reducer;

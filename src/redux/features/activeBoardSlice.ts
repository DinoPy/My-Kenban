import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: '' };

export const activeBoardSlice = createSlice({
	name: 'activeBoardSlice',
	initialState,
	reducers: {
		setActiveBoard: (state, action) => {
			state.value = action.payload;
		},
	},
});

export const { setActiveBoard } = activeBoardSlice.actions;

export default activeBoardSlice.reducer;

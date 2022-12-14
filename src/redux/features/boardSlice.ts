import { createSlice } from '@reduxjs/toolkit';

export interface boardInterface {
	value:
		| {
				id: string;
				title: string;
				icon: string;
				description: string;
				position: number;
				favorite: boolean;
				favoritePosition: number;
				createdAt: string;
				userId: string;
				archived: boolean;
				folderId: string;
		  }[]
		| [];
}
const initialState: boardInterface = { value: [] };

export const boardSlice = createSlice({
	name: 'board',
	initialState,
	reducers: {
		setBoards: (state, action) => {
			state.value = action.payload;
		},
	},
});

export const { setBoards } = boardSlice.actions;

export default boardSlice.reducer;

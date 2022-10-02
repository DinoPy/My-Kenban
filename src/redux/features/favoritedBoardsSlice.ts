import { createSlice } from '@reduxjs/toolkit';

interface favorited {
	value:
		| {
				id: string;
				title: string;
				icon: string;
				favoritedPosition: number;
		  }[]
		| [];
}

const initialValue: favorited = { value: [] };

const favoritedBoardsSlice = createSlice({
	name: 'favoritedBoards',
	initialState: initialValue,
	reducers: {
		setFavoritedBoards: (state, action) => {
			state.value = action.payload;
		},
	},
});

export const { setFavoritedBoards } = favoritedBoardsSlice.actions;

export default favoritedBoardsSlice.reducer;

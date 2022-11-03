import { createSlice } from '@reduxjs/toolkit';
import { boolean } from 'zod';

interface folderInterface {
	value:
		| {
				id: string;
				name: string;
				userSchemaId: string;
				position: number;
				archived: boolean;
				Board: {
					id: string;
					title: string;
					icon: string;
					description: string;
					position: number;
					favorite: boolean;
					favoritePosition: number;
					createdAt: string;
					userId: string;
					folderId: string;
					archived: boolean;
				}[];
		  }[]
		| [];
}

const initialState: folderInterface = {
	value: [],
};

export const folderSlice = createSlice({
	name: 'folder',
	initialState,
	reducers: {
		setFolders: (state, action) => {
			state.value = action.payload;
		},
	},
});

export const { setFolders } = folderSlice.actions;

export default folderSlice.reducer;

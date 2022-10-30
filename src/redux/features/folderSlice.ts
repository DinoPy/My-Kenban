import { createSlice } from '@reduxjs/toolkit';

interface folderInterface {
	value:
		| {
				id: string;
				name: string;
				userSchemaId: string;
				position: number;
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

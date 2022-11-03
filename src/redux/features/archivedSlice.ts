import { createSlice } from '@reduxjs/toolkit';

interface archivedInterface {
	value: {
		folders: boolean;
		boards: boolean;
		sections: boolean;
		tasks: boolean;
	};
}

const initialState: archivedInterface = {
	value: {
		folders: false,
		boards: false,
		sections: false,
		tasks: false,
	},
};

export const archivedSlice = createSlice({
	name: 'archived',
	initialState,
	reducers: {
		setArchived: (state, action) => {
			state.value = action.payload;
		},
	},
});

export const { setArchived } = archivedSlice.actions;

export default archivedSlice.reducer;

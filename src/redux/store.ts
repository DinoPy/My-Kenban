import { configureStore } from '@reduxjs/toolkit';
import boardReducer from './features/boardSlice';
import activeBoardReducer from './features/activeBoardSlice';
import favoritedBoardReducer from './features/favoritedBoardsSlice';
import folderReducer from './features/folderSlice';

export const store = configureStore({
	reducer: {
		board: boardReducer,
		activeBoard: activeBoardReducer,
		favoritedBoards: favoritedBoardReducer,
		folders: folderReducer,
	},
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

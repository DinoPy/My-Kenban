//import {createSlice} from '@reduxjs/toolkit';
//const initialState = {value: {}}

//export const userSlice = createSlice({
//  name: 'user',
//  initialState,
//  reducers: {
//setUser: (state, action) => {
//  state.value = action.payload;
//},
//  },
//});

//export const {setUser} = userSlice.actions;

//export default userSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
// import userReducer from './features/userSlice';

export const store = configureStore({
	reducer: {
		// user: userReducer,
	},
});

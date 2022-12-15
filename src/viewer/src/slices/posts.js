import { createSlice } from '@reduxjs/toolkit'

export const postsSlice = createSlice({
	name: 'posts',
	initialState: {
		posts: [],
		private: false
	},
	reducers: {}
});

export const { setPosts, setPrivate } = postsSlice.actions;
export default postsSlice.reducer;
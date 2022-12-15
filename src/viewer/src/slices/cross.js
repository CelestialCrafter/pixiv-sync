import { createSlice } from '@reduxjs/toolkit'

export const postsSlice = createSlice({
	name: 'cross',
	initialState: {
		tags: [],
		currentTags: [],
		posts: [],
		currentPosts: [],
		private: false
	},
	reducers: {}
});

export const {
	setCurrentPosts, // @TODO make this get the tags and posts, filter by matching
} = postsSlice.actions;
export default postsSlice.reducer;
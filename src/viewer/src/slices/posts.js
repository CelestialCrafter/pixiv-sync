import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { updateFilters } from './filters';

import likes from '../data/likes.json';
import posts from '../data/posts.json';
import privatePosts from '../data/privatePosts.json';
import tags from '../data/tags.json';

export const initialState = {
	currentPosts: [],
	privateEnabled: false
};

export const updateCurrentPosts = createAsyncThunk('posts/updateCurrentPosts', async (_arg, thunkAPI) => {
	const { dispatch } = thunkAPI;
	const state = thunkAPI.getState();

	let newPosts = [];

	const usedPosts = state.posts.privateEnabled ? privatePosts : posts;
	const postsWithTags = usedPosts.map(post => ({
		id: post.id,
		tagsEn: post.tags.map(tag => tags[tag]).filter(t => t)
	}));

	newPosts = usedPosts
		.filter(post => {
			const postTags = postsWithTags.find(p => p.id === post.id)?.tagsEn;
			return state.tags.currentTags.every(tag => postTags.includes(tag));
		});

	dispatch(updateFilters(newPosts));

	newPosts = newPosts.filter(post => {
		const { width, height } = post.sizes[0];
		const { width: widthFilter, height: heightFilter } = state.filters;

		if (width < widthFilter.min) return false;
		else if (height < heightFilter.min) return false;
		else if (width > widthFilter.max) return false;
		else if (height > heightFilter.max) return false;

		return true;
	});

	const sortValue = likes;
	if (state.sort.state === 1) newPosts.sort((a, b) => {
		const aValue = sortValue[Number(a.id)];
		const bValue = sortValue[Number(b.id)];

		if (!aValue) return 1;
		if (!bValue) return -1;
		return aValue > bValue ? -1 : 1;
	});

	if (state.sort.state === 2) newPosts.sort((a, b) => {
		const aValue = sortValue[Number(a.id)];
		const bValue = sortValue[Number(b.id)];

		if (!aValue) return 1;
		if (!bValue) return -1;
		return aValue > bValue ? 1 : -1;
	});

	return newPosts;
});

export const postsSlice = createSlice({
	name: 'posts',
	initialState,
	reducers: {
		setPrivateEnabled: (state, action) => { state.privateEnabled = action.payload; },
		togglePrivateEnabled: state => { state.privateEnabled = !state.privateEnabled; }
	},
	extraReducers: builder => builder.addCase(updateCurrentPosts.fulfilled, (state, action) => { state.currentPosts = action.payload; })
});

export const selectPrivateEnabled = state => state.posts.privateEnabled;
export const selectAllCurrentPosts = state => state.posts.currentPosts;

export const { setPosts, setPrivatePosts, setPrivateEnabled, togglePrivateEnabled } = postsSlice.actions;
export default postsSlice.reducer;
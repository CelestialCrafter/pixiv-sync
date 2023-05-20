import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import likes from '../data/likes.json';
import posts from '../data/posts.json';
import privatePosts from '../data/privatePosts.json';
import tags from '../data/tags.json';

export const initialState = {
	currentPosts: [],
	postsOverride: [],
	privateEnabled: false,
	selectedPost: null,
	refererEnabled: false
};

export const setPostsFromPixiv = createAsyncThunk('posts/setPostsFromPixiv', async (url, { dispatch }) => {
	const posts = await (await fetch(url)).json();

	dispatch(setPostsOverride(posts));
	dispatch(updateCurrentPosts());
});

export const addPostsFromPixiv = createAsyncThunk('posts/addPostsFromPixiv', async (url, { dispatch, getState }) => {
	const posts = await (await fetch(url)).json();

	dispatch(setPostsOverride([...getState().posts.postsOverride, ...posts]));
	dispatch(updateCurrentPosts());
});

export const resetPostsOverride = createAsyncThunk('posts/resetPostsOverride', async (postId, { dispatch }) => {
	dispatch(setPostsOverride([]));
	dispatch(updateCurrentPosts());
});

export const updateCurrentPosts = createAsyncThunk('posts/updateCurrentPosts', async (_arg, thunkAPI) => {
	const state = thunkAPI.getState();

	let newPosts = [];
	let usedPosts = [];

	if (state.posts.postsOverride[0]) usedPosts = state.posts.postsOverride;
	else if (state.posts.privateEnabled) usedPosts = privatePosts.map(post => ({ ...post, local: true }));
	else usedPosts = posts.map(post => ({ ...post, local: true }));

	usedPosts = usedPosts.filter((value, index, self) => index === self.findIndex(t => t.id === value.id));

	const postsWithTags = usedPosts.map(post => ({
		id: post.id,
		tagsEn: post.tags.map(tag => tags[tag]).filter(t => t)
	}));

	newPosts = usedPosts
		.filter(post => {
			const postTags = postsWithTags.find(p => p.id === post.id)?.tagsEn;
			return state.tags.currentTags.every(tag => postTags.includes(tag));
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
		setPostsOverride: (state, action) => { state.postsOverride = action.payload; },
		setPrivateEnabled: (state, action) => { state.privateEnabled = action.payload; },
		togglePrivateEnabled: state => { state.privateEnabled = !state.privateEnabled; },
		setSelectedPost: (state, action) => { state.selectedPost = action.payload; },
		deleteSelectedPost: state => { state.selectedPost = null; },
		setRefererEnabled: (state, action) => { state.refererEnabled = action.payload; },
	},
	extraReducers: builder => builder.addCase(updateCurrentPosts.fulfilled, (state, action) => { state.currentPosts = action.payload; })
});

export const selectSelectedPost = state => state.posts.selectedPost;
export const selectPrivateEnabled = state => state.posts.privateEnabled;
export const selectAllCurrentPosts = state => state.posts.currentPosts;
export const selectRefererEnabled = state => state.posts.refererEnabled;

export const { setPostsOverride, setPrivateEnabled, togglePrivateEnabled, setSelectedPost, deleteSelectedPost, setRefererEnabled } = postsSlice.actions;
export default postsSlice.reducer;
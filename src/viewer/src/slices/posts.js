import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const initialState = {
	posts: [],
	privatePosts: [],
	currentPosts: [],
	privateEnabled: false,
	postsStatus: 'idle',
	privatePostsStatus: 'idle',
	error: ''
};

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => (await axios(`http://${process.env.REACT_APP_API_IP}/data/posts.json`)).data);
export const fetchPrivatePosts = createAsyncThunk('posts/fetchPrivatePosts', async () => (await axios(`http://${process.env.REACT_APP_API_IP}/data/privatePosts.json`)).data);

export const postsSlice = createSlice({
	name: 'posts',
	initialState,
	reducers: {
		setPosts: (state, action) => { state.posts = action.payload; },
		setPrivatePosts: (state, action) => { state.privatePosts = action.payload; },
		setPrivateEnabled: (state, action) => { state.privateEnabled = action.payload; },
		togglePrivateEnabled: state => { state.privateEnabled = !state.privateEnabled; }
	},
	extraReducers: builder => {
		builder.addCase(fetchPosts.pending, state => { state.postsStatus = 'loading'; })
			.addCase(fetchPosts.fulfilled, (state, action) => {
				state.postsStatus = 'succeeded';
				state.posts = action.payload;
			})
			.addCase(fetchPosts.rejected, (state, action) => {
				state.postsStatus = 'failed';
				state.error = action.error.message;
			});

		builder.addCase(fetchPrivatePosts.pending, state => { state.privatePostsStatus = 'loading'; })
			.addCase(fetchPrivatePosts.fulfilled, (state, action) => {
				state.privatePostsStatus = 'succeeded';
				state.privatePosts = action.payload;
			})
			.addCase(fetchPrivatePosts.rejected, (state, action) => {
				state.privatePostsStatus = 'failed';
				state.error = action.error.message;
			});
	}
});

export const selectError = state => state.posts.error;
export const selectAllPosts = state => state.posts.posts;
export const selectAllPrivatePosts = state => state.posts.privatePosts;
export const selectPrivateEnabled = state => state.posts.privateEnabled;

export const { setPosts, setPrivatePosts, setPrivateEnabled, togglePrivateEnabled } = postsSlice.actions;
export default postsSlice.reducer;
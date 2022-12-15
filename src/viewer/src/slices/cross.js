import { createSlice } from '@reduxjs/toolkit';
import { initialState as postsInitialState } from './posts';
import { initialState as tagsInitialState } from './tags';

export const crossSlice = createSlice({
	name: 'cross',
	initialState: {
		tags: tagsInitialState,
		posts: postsInitialState
	},
	reducers: {
		setCurrentPosts: state => {
			const posts = state.posts.privateEnabled ? state.posts.privatePosts : state.posts.posts;
			const postsWithTags = posts.map(post => ({
				id: post.id,
				tagsEn: post.tags.map(tag => state.tags.tags[tag]).filter(t => t)
			}));

			state.posts.currentPosts = posts.filter(post => {
				const postTags = postsWithTags.find(p => p.id === post.id)?.tagsEn;
				return state.tags.currentTags.every(tag => postTags.includes(tag));
			});
		}
	}
});

export const selectAllCurrentPosts = state => state.posts.currentPosts;

export const {
	setCurrentPosts
} = crossSlice.actions;
export default crossSlice.reducer;

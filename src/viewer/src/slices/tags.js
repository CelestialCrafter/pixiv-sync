import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const initialState = {
	tags: {},
	currentTags: [],
	status: 'idle',
	error: ''
};

export const fetchTags = createAsyncThunk('tags/fetchTags', async () => (await axios(`http://${process.env.REACT_APP_API_IP}/data/tags.json`)).data);

export const tagsSlice = createSlice({
	name: 'tags',
	initialState,
	reducers: {
		setTags: (state, action) => { state.tags = action.payload; },
		setCurrentTags: (state, action) => { state.currentTags = action.payload; },
		addCurrentTag: (state, action) => { state.currentTags.push(action.payload); },
		removeCurrentTag: (state, action) => { state.currentTags = state.currentTags.filter(tag => tag !== action.payload); },
		toggleTag: (state, action) => {
			console.log(state.currentTags.find(tag => tag === action.payload));
			if (state.currentTags.find(tag => tag === action.payload))
				state.currentTags = state.currentTags.filter(tag => tag !== action.payload);
			else state.currentTags.push(action.payload);
		}
	},
	extraReducers: builder => {
		builder.addCase(fetchTags.pending, state => { state.status = 'loading'; })
			.addCase(fetchTags.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.tags = { ...state.tags, ...action.payload };
			})
			.addCase(fetchTags.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			});
	}
});

export const selectError = state => state.tags.error;
export const selectAllTags = state => state.tags.tags;
export const selectAllCurrentTags = state => state.tags.currentTags;
export const selectTagsLoading = state => state.tags.loading;

export const {
	setTags,
	setCurrentTags,
	addCurrentTag,
	removeCurrentTag,
	toggleTag
} = tagsSlice.actions;
export default tagsSlice.reducer;
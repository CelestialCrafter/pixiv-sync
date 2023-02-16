import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
	currentTags: []
};

export const tagsSlice = createSlice({
	name: 'tags',
	initialState,
	reducers: {
		setCurrentTags: (state, action) => { state.currentTags = action.payload; },
		addCurrentTag: (state, action) => { state.currentTags.push(action.payload); },
		removeCurrentTag: (state, action) => { state.currentTags = state.currentTags.filter(tag => tag !== action.payload); },
		toggleTag: (state, action) => {
			if (state.currentTags.find(tag => tag === action.payload))
				state.currentTags = state.currentTags.filter(tag => tag !== action.payload);
			else state.currentTags.push(action.payload);
		}
	}
});

export const selectAllCurrentTags = state => state.tags.currentTags;

export const {
	setCurrentTags,
	addCurrentTag,
	removeCurrentTag,
	toggleTag
} = tagsSlice.actions;
export default tagsSlice.reducer;
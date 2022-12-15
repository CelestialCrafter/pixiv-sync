import { createSlice } from '@reduxjs/toolkit'

export const tagsSlice = createSlice({
	name: 'tags',
	initialState: {
		tags: [],
		currentTags: [],
	},
	reducers: {}
});

export const {
	setTags,
	setCurrentTags,
	addCurrentTag,
	removeCurrentTag
} = tagsSlice.actions;
export default tagsSlice.reducer;
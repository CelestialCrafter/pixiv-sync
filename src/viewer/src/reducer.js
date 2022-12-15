import { combineReducers } from '@reduxjs/toolkit'

import posts from './slices/posts';
import tags from './slices/tags';
import crossSlice from './slices/cross';

const postTagsReducer = combineReducers({
	posts,
	tags
});

const rootReducer = (state, action) => {
	const intermediateState = postTagsReducer(state, action);
	const finalState = crossSlice(intermediateState, action);
	return finalState;
};

export default rootReducer;

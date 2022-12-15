import { combineReducers } from '@reduxjs/toolkit';
import reduceReducers from 'reduce-reducers';

import posts from './slices/posts';
import tags from './slices/tags';
import sync from './slices/sync';
import cross from './slices/cross';

const combinedReducer = combineReducers({
	posts,
	tags,
	sync
});

const rootReducer = reduceReducers(combinedReducer, cross);

export default rootReducer;
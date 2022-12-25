import { combineReducers } from '@reduxjs/toolkit';

import posts from './slices/posts';
import tags from './slices/tags';
import sync from './slices/sync';
import filters from './slices/filters';
import sort from './slices/sort';

export default combineReducers({
	posts,
	tags,
	sync,
	filters,
	sort
});

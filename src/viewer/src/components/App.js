import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';

import Images from './Images';
import Sidebar from './Sidebar';
import './App.css';

import { fetchTags } from '../slices/tags';
import { setCurrentPosts } from '../slices/cross';
import { fetchPosts, fetchPrivatePosts } from '../slices/posts';
import { fetchSettings } from '../slices/sync';

const socket = io(`ws://${process.env.REACT_APP_API_IP}`);

const App = () => {
	const dispatch = useDispatch();

	const postsStatus = useSelector(state => state.posts.postsStatus);
	const privatePostsStatus = useSelector(state => state.posts.privatePostsStatus);
	const tagsStatus = useSelector(state => state.tags.status);
	const syncSettingsStatus = useSelector(state => state.sync.status);

	const succeeded = postsStatus === 'succeeded' && privatePostsStatus === 'succeeded' && tagsStatus === 'succeeded';
	const failed = postsStatus === 'failed' || privatePostsStatus === 'failed' || tagsStatus === 'failed';

	const tagsError = useSelector(state => state.tags.error);
	const postsError = useSelector(state => state.posts.error);

	useEffect(() => {
		if (postsStatus === 'idle') dispatch(fetchPosts());
		if (privatePostsStatus === 'idle') dispatch(fetchPrivatePosts());
		if (tagsStatus === 'idle') dispatch(fetchTags());
		if (syncSettingsStatus === 'idle') dispatch(fetchSettings());
	}, [postsStatus, privatePostsStatus, dispatch, tagsStatus, syncSettingsStatus]);

	useEffect(() => {
		if (postsStatus === 'succeeded' && privatePostsStatus === 'succeeded') dispatch(setCurrentPosts());
	}, [dispatch, postsStatus, privatePostsStatus, succeeded]);

	if (succeeded) {
		return <React.Fragment>
			<Images />

			<Sidebar socket={socket} />
		</React.Fragment>;
	} else if (failed) {
		return <div className="errored"><h1>Error!</h1><code>{postsError || tagsError}</code></div>;
	} else {
		return <div className="loading"><h1>Loading...</h1></div>;
	}
};

export default App;

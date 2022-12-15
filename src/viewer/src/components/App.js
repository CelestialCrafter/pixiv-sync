import React, { useEffect, useRef } from 'react';
import { fetchPosts, fetchPrivatePosts } from '../slices/posts';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTags } from '../slices/tags';
import io from 'socket.io-client';

import './App.css';
import Tags from './Tags';
import Images from './Images';
import { setCurrentPosts } from '../slices/cross';
import { addSyncData, fetchSettings, selectAllSyncData, selectSyncSettings, setSyncData, setSyncSettings } from '../slices/sync';

const socket = io(`ws://${process.env.REACT_APP_API_IP}`);

const App = () => {
	const dispatch = useDispatch();

	const syncDataRef = useRef(null);

	useEffect(() => {
		socket.on('settings', newSettings => dispatch(setSyncSettings(newSettings)));
		socket.on('syncData', data => {
			if (syncDataRef.current) syncDataRef.current.scroll(0, 65536);
			dispatch(addSyncData(data));
		});

		return () => {
			socket.off('connect');
			socket.off('settings');
			socket.off('syncData');
		};
	}, [dispatch]);

	const postsStatus = useSelector(state => state.posts.postsStatus);
	const privatePostsStatus = useSelector(state => state.posts.privatePostsStatus);
	const tagsStatus = useSelector(state => state.tags.status);
	const syncSettingsStatus = useSelector(state => state.sync.status);

	const tagsError = useSelector(state => state.tags.error);
	const postsError = useSelector(state => state.posts.error);

	const syncData = useSelector(selectAllSyncData);
	const settings = useSelector(selectSyncSettings);

	useEffect(() => {
		if (postsStatus === 'idle') dispatch(fetchPosts());
		if (privatePostsStatus === 'idle') dispatch(fetchPrivatePosts());
		if (tagsStatus === 'idle') dispatch(fetchTags());
		if (syncSettingsStatus === 'idle') dispatch(fetchSettings());
	}, [postsStatus, privatePostsStatus, dispatch, tagsStatus, syncSettingsStatus]);

	const succeeded = postsStatus === 'succeeded' && privatePostsStatus === 'succeeded' && tagsStatus === 'succeeded';
	const failed = postsStatus === 'failed' || privatePostsStatus === 'failed' || tagsStatus === 'failed';

	useEffect(() => {
		if (succeeded) dispatch(setCurrentPosts());
	}, [dispatch, succeeded]);

	if (succeeded) {

		return <React.Fragment>
			<Images />

			<div className="sidebar" style={{ width: window.innerWidth * 0.15 }}>
				<ul className="syncData" ref={syncDataRef}>{syncData.map((data, i) => <li key={i}>{data}</li>)}</ul>
				<div style={{ padding: 4, marginBottom: 8 }}>
					<code>{JSON.stringify(settings)}</code>
				</div>

				<button onClick={() => socket.emit('sync')}>Sync</button>
				<button onClick={() => setSyncData([])}>Clear Output</button>
				<Tags />
			</div>
		</React.Fragment>;
	} else if (failed) {
		return <div className="errored"><h1>Error!</h1><code>{postsError || tagsError}</code></div>;
	} else {
		return <div className="loading"><h1>Loading...</h1></div>;
	}
};

export default App;

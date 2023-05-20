import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';

import Images from './Images';
import ContextMenu from './ContextMenu';
import Sidebar from './sidebar/Sidebar';
import JumpTo from './JumpTo';
import './App.css';

import { fetchSettings } from '../slices/sync';
import { updateCurrentPosts } from '../slices/posts';

const socket = io(`ws://${process.env.REACT_APP_API_IP}`);

// @TODO: add artist viewer
// @TODO: add image full view, image settings (details in nthprsnl dms)
// @TODO: add user feedback (with like.svg animations) when user likes/unlikes, or if unlike errors (already liked)
// @TODO: add fanbox/patreon scraper, then use kemono.party to add a viewer

const App = () => {
	const dispatch = useDispatch();
	const imagesRef = useRef();

	const syncSettingsStatus = useSelector(state => state.sync.status);

	useEffect(() => { dispatch(updateCurrentPosts()); }, [dispatch]);

	useEffect(() => {
		if (syncSettingsStatus === 'idle') dispatch(fetchSettings());
	}, [dispatch, syncSettingsStatus]);

	return <React.Fragment>
		<ContextMenu>
			<Images imagesRef={imagesRef} />
		</ContextMenu>
		<JumpTo imagesRef={imagesRef} />

		<Sidebar socket={socket} />
	</React.Fragment>;
};

export default App;

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';

import Images from './Images';
import ContextMenu from './ContextMenu';
import Sidebar from './sidebar/Sidebar';
import JumpTo from './JumpTo';
import './App.css';

import { fetchSettings } from '../slices/sync';
import { updateCurrentPosts, setRefererEnabled } from '../slices/posts';

const socket = io(`ws://${process.env.REACT_APP_API_IP}`);

// @TODO add image full view
// @TODO add image details in PostSidebar
// @TODO add fanbox/patreon scraper, then use kemono.party to add a viewer

const App = () => {
	const dispatch = useDispatch();
	const imagesRef = useRef();

	const syncSettingsStatus = useSelector(state => state.sync.status);

	useEffect(() => {
		const testURL = 'https://i.pximg.net/c/48x48/img-master/img/2023/03/18/00/01/01/106307440_p0_square1200.jpg';
		let testImg = new Image();
		testImg.onload = () => dispatch(setRefererEnabled(true));
		testImg.onerror = () => testImg = null;
		testImg.src = testURL;
	}, [dispatch]);

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

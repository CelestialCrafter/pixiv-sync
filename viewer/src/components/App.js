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

/* SORTED (roughly) BY PRIORITY */
// @TODO add image full view
// @TODO add image details in PostSidebar
// @TODO change the settings menu to a modal (maybe), and let the user choose: brightness, set images per line, browse age restriction mode (all, r18, safe (app.js:169:55))
// @TODO add a loading indicator while loading the extra post pages
// @TODO use issues instead of a bunch of todo's....
// @TODO add the ability to set a custom post into the PostSidebar
// @TODO maybe create a new like button from template on like instead of showing it and playing an animation, so whenever you move the ctx menu the like button doesnt move
// @TODO styling overhaul (if needed)
// @TODO use kemono.party's creator.txt (json format lol) + scrape kemono.party with cheerio and create an api based off of scraped data
// @TODO add support for ugorias (maybe, probably not hehe)

const socket = io(`ws://${process.env.REACT_APP_API_IP}`);

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

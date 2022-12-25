import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';

import Images from './Images';
import Sidebar from './Sidebar';
import './App.css';

import { fetchSettings } from '../slices/sync';
import { updateCurrentPosts } from '../slices/posts';

const socket = io(`ws://${process.env.REACT_APP_API_IP}`);

const App = () => {
	const dispatch = useDispatch();

	const syncSettingsStatus = useSelector(state => state.sync.status);

	useEffect(() => { dispatch(updateCurrentPosts()); }, [dispatch]);

	useEffect(() => {
		if (syncSettingsStatus === 'idle') dispatch(fetchSettings());
	}, [dispatch, syncSettingsStatus]);

	return <React.Fragment>
		<Images />

		<Sidebar socket={socket} />
	</React.Fragment>;
};

export default App;

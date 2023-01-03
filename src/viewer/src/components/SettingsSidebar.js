import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectAllSyncData, setSyncData, addSyncData } from '../slices/sync';

import Tags from './Tags';
import Settings from './Settings';

import './SettingsSidebar.css';

const SettingsSidebar = ({ socket }) => {
	const dispatch = useDispatch();
	const syncDataRef = useRef(null);

	const syncData = useSelector(selectAllSyncData);

	useEffect(() => {
		socket.on('syncData', chunk => {
			chunk.forEach(data => dispatch(addSyncData(data)));

			const syncDataElement = syncDataRef.current;
			syncDataElement.scroll(0, syncDataElement.scrollHeight);
		});

		return () => {
			socket.off('connect');
			socket.off('settings');
			socket.off('syncData');
		};
	}, [dispatch, socket]);

	return <React.Fragment>
		<Settings socket={socket} />

		<button onClick={() => socket.emit('sync')}>Sync</button>
		<button onClick={() => dispatch(setSyncData([]))}>Clear Output</button>

		<Tags />
		<ul className="syncData" ref={syncDataRef} style={{ marginTop: 4 }}>{syncData.map((data, i) => <li key={i}>{data}</li>)}</ul>
	</React.Fragment>;
};

export default SettingsSidebar;
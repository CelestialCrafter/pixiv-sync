import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectAllSyncData, setSyncData, addSyncData } from '../../slices/sync';

import Tags from './settings/Tags';
import Settings from './settings/Settings';

import './SettingsSidebar.css';

const SettingsSidebar = ({ socket }) => {
	const dispatch = useDispatch();
	const syncDataRef = useRef(null);

	const syncData = useSelector(selectAllSyncData);

	useEffect(() => {
		socket.on('syncData', chunk => chunk.forEach(data => dispatch(addSyncData(data))));

		return () => {
			socket.off('connect');
			socket.off('settings');
			socket.off('syncData');
		};
	}, [dispatch, socket]);

	useEffect(() => {
		const syncDataElement = syncDataRef.current;
		syncDataElement.scroll(0, syncDataElement.scrollHeight);
	}, [syncData]);

	return <React.Fragment>
		<Settings socket={socket} />

		<div style={{ margin: '1%' }}>
			<button onClick={() => socket.emit('sync')}>Sync</button>
			<button onClick={() => socket.emit('endSync')}>End Sync</button>
			<button onClick={() => dispatch(setSyncData([]))}>Clear Output</button>
			<Tags />
		</div>
		<ul className="syncData" ref={syncDataRef} style={{ marginTop: 4 }}>{syncData.map((data, i) => <li key={i}>{data}</li>)}</ul>
	</React.Fragment>;
};

export default SettingsSidebar;
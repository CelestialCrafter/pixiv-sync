import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectAllSyncData, setSyncData, addSyncData } from '../slices/sync';

import Tags from './Tags';
import Settings from './Settings';

const Sidebar = ({ socket }) => {
	const [hidden, setHidden] = useState(true);
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

	return <div className="sidebarLeftWrapper" style={{ width: hidden ? 0 : null, height: hidden ? 0 : null, backgroundColor: hidden ? 'inherit' : 'white' }}>
		<button
			className="menu"
			onClick={() => setHidden(!hidden)}
		><i className="material-icons">menu</i></button>

		<div className="sidebarLeft" style={{
			display: hidden ? 'none' : 'inherit',
			padding: 4,
			paddingTop: 0,
			marginBottom: 8
		}}>
			<Settings socket={socket} />

			<button onClick={() => socket.emit('sync')}>Sync</button>
			<button onClick={() => dispatch(setSyncData([]))}>Clear Output</button>

			<Tags />
			<ul className="syncData" ref={syncDataRef} style={{ marginTop: 4 }}>{syncData.map((data, i) => <li key={i}>{data}</li>)}</ul>
		</div>
	</div>;
};

export default Sidebar;
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectAllSyncData, setSyncData, addSyncData } from '../slices/sync';

import Tags from './Tags';
import Settings from './Settings';
import { fetchPosts, fetchPrivatePosts } from '../slices/posts';
import { fetchTags } from '../slices/tags';

const Sidebar = ({ socket }) => {
	const [hidden, setHidden] = useState(true);
	const dispatch = useDispatch();
	const syncDataRef = useRef(null);

	const syncData = useSelector(selectAllSyncData);

	useEffect(() => {
		socket.on('syncData', data => {
			if (syncDataRef.current) syncDataRef.current.scroll(0, 65536);
			dispatch(addSyncData(data));
			if (data === 'Finished Sync') {
				dispatch(fetchPosts());
				dispatch(fetchPrivatePosts());
				dispatch(fetchTags());
			}
		});

		return () => {
			socket.off('connect');
			socket.off('settings');
			socket.off('syncData');
		};
	}, [dispatch, socket]);

	return <div className="sidebarLeftWrapper" style={{ backgroundColor: hidden ? 'inherit' : 'white' }}>
		<button
			className="menu"
			onClick={() => setHidden(!hidden)}
		><i className="material-icons">menu</i></button>

		<div className="sidebarLeft" style={{ display: hidden ? 'none' : 'inherit' }}>
			<div style={{ padding: 4, paddingTop: 0, marginBottom: 8 }}>
				<Settings socket={socket} />
			</div>

			<button onClick={() => socket.emit('sync')}>Sync</button>
			<button onClick={() => setSyncData([])}>Clear Output</button>

			<Tags />
			<ul className="syncData" ref={syncDataRef} style={{ marginTop: 4 }}>{syncData.map((data, i) => <li key={i}>{data}</li>)}</ul>
		</div>
	</div>;
};

export default Sidebar;
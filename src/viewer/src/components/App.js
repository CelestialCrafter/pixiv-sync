// @TODO implement redux

import React, { useEffect, useRef, useState } from 'react';
import Tags from './Tags';
import Images from './Images';
import axios from 'axios';
import io from 'socket.io-client';

import './App.css';

const socket = io('ws://localhost');

const App = () => {
	const [privateImages, setPrivateImages] = useState(false);
	const [privatePosts, setPrivatePosts] = useState([]);
	const [currentTags, setCurrentTags] = useState([]);
	const [syncData, setSyncData] = useState([]);
	const [settings, setSettings] = useState({});
	const [posts, setPosts] = useState([]);
	const [tags, setTags] = useState([]);
	const [forceUpdate, setForceUpdate] = useState(() => { });

	const syncDataRef = useRef(null);

	useEffect(() => {
		socket.on('settings', newSettings => setSettings(newSettings));
		socket.on('syncData', data => {
			if (syncDataRef.current) syncDataRef.current.scroll(0, 65536)
			setSyncData(prevSyncData => [...prevSyncData, data]);
		});

		const fetchData = async () => {
			setSettings((await axios('http://localhost/config')).data)
			setPrivatePosts((await axios('http://localhost/data/privatePosts.json')).data);
			setPosts((await axios('http://localhost/data/posts.json')).data);
			setTags((await axios('http://localhost/data/tags.json')).data);
		};

		fetchData();

		return () => {
			socket.off('connect');
			socket.off('settings');
			socket.off('syncData');
		};
	}, []);

	return posts[0] && privatePosts[0] && Object.keys(tags)[0] ?
		<React.Fragment>
			<Images
				currentTags={currentTags}
				privateImages={privateImages}
				privatePosts={privatePosts}
				posts={posts}
				tags={tags}
				setForceUpdate={setForceUpdate}
			/>

			<div className="sidebar" style={{ width: window.innerWidth * 0.15 }}>
				<ul className="syncData" ref={syncDataRef}>{syncData.map((data, i) => <li key={i}>{data}</li>)}</ul>
				<div style={{ padding: 4, marginBottom: 8 }}>
					<code>{JSON.stringify(settings)}</code>
				</div>

				<button onClick={() => socket.emit('sync')}>Sync</button>
				<button onClick={() => setSyncData([])}>Clear Output</button>
				<Tags
					setCurrentTags={setCurrentTags}
					currentTags={currentTags}
					setPrivateImages={setPrivateImages}
					privateImages={privateImages}
					privatePosts={privatePosts}
					setPrivatePosts={setPrivatePosts}
					posts={posts}
					setPosts={setPrivatePosts}
					tags={tags}
					forceUpdate={forceUpdate}
				/>
			</div>
		</React.Fragment> :
		<React.Fragment></React.Fragment>
};

export default App;

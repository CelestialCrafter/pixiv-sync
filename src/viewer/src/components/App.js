import React, { useEffect, useState } from 'react';
import Tags from './Tags';
import Images from './Images';
import axios from 'axios';

import './App.css';

const App = () => {
	const [currentTags, setCurrentTags] = useState([]);
	const [privateImages, setPrivateImages] = useState(false);
	const [privatePosts, setPrivatePosts] = useState([]);
	const [posts, setPosts] = useState([]);
	const [tags, setTags] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			setPrivatePosts((await axios('http://localhost/data/privatePosts.json')).data);
			setPosts((await axios('http://localhost/data/posts.json')).data);
			setTags((await axios('http://localhost/data/tags.json')).data);
		};

		fetchData();
	}, []);

	return posts[0] && privatePosts[0] && Object.keys(tags)[0] ?
		<div>
			<Tags setCurrentTags={setCurrentTags} currentTags={currentTags} setPrivateImages={setPrivateImages} privateImages={privateImages} privatePosts={privatePosts} posts={posts} tags={tags} />
			<Images currentTags={currentTags} privateImages={privateImages} privatePosts={privatePosts} posts={posts} />
		</div> :
		<React.Fragment></React.Fragment>
};

export default App;

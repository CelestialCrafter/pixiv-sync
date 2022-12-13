import React, { useState } from 'react';
import Tags from './Tags';
import Images from './Images';

const App = () => {
	const [currentTags, setCurrentTags] = useState([]);
	const [nsfw, setNsfw] = useState(false);

	return (
		<div>
			<Tags setCurrentTags={setCurrentTags} currentTags={currentTags} setNsfw={setNsfw} nsfw={nsfw} />
			<Images currentTags={currentTags} nsfw={nsfw} />
		</div>
	);
};

export default App;

import React from 'react';
import { VisibleImage } from 'react-visible-image';

import tags from '../data/tags.json';

const MemoizedVisibleImage = React.memo(VisibleImage);

const calculateNewDimensions = (sourceWidth, sourceHeight, maxWidth) => {
	const ratio = maxWidth / sourceWidth;
	return { width: sourceWidth * ratio, height: sourceHeight * ratio };
};

const Image = ({ posts, i, page, privateImages, forceLoad, setLoaded }) => {
	const post = posts[i];
	const enTagsString = post.tags.map(tag => tags[tag]).filter(t => t).join(', ');

	const rowSize = 4;
	const imageWidth = window.innerWidth / rowSize;
	let topPx = 0;
	const originalColumn = i % rowSize;

	for (let newI = 0; newI < i; newI++) {
		const column = newI % rowSize;
		if (column !== originalColumn) continue;

		const newPost = posts[newI];
		topPx += calculateNewDimensions(newPost.width, newPost.height, imageWidth).height;
	}

	return <MemoizedVisibleImage
		forceShow={forceLoad}
		onLoad={() => setLoaded ? setLoaded(true) : null}
		onClick={() => window.open(`https://pixiv.net/artworks/${post.id}`, '_blank')}
		alt={`${post.id} - ${enTagsString}`}
		style={{
			position: 'absolute',
			width: imageWidth,
			height: calculateNewDimensions(post.width, post.height, imageWidth).height,
			top: 200 + topPx,
			left: i % rowSize * (imageWidth)
		}}
		className="image"
		src={`http://localhost/${privateImages ? 'private' : 'images'}/${post.id}-${page}.jpg`}
		title={`${post.id} - ${enTagsString}`}
	/>
};

export default Image;
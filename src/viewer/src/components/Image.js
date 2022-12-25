import React from 'react';
import { VisibleImage } from 'react-visible-image';
import { useSelector } from 'react-redux';

import { selectPrivateEnabled } from '../slices/posts';
import { selectAllCurrentPosts } from '../slices/posts';

import tags from '../data/tags.json';

const calculateNewDimensions = (sourceWidth, sourceHeight, maxWidth) => {
	const ratio = maxWidth / sourceWidth;
	return { width: sourceWidth * ratio, height: sourceHeight * ratio };
};

// @TODO add a seperate image viewer in a right sidebar for singular images, and show all of the image pages

const Image = ({ i, forceLoad, setLoaded, windowWidth }) => {
	const privateEnabled = useSelector(selectPrivateEnabled);
	const posts = useSelector(selectAllCurrentPosts);

	const post = posts[i];
	const postSize = post.sizes[0];
	const enTagsString = post.tags.map(tag => tags[tag]).filter(t => t).join(', ');

	let rowSize;
	if (windowWidth <= 480) rowSize = 1;
	else if (windowWidth <= 640) rowSize = 2;
	else if (windowWidth <= 960) rowSize = 3;
	else rowSize = 4;

	const imageWidth = windowWidth / rowSize;
	const originalColumn = i % rowSize;
	let topPx = 0;

	for (let newI = 0; newI < i; newI++) {
		const column = newI % rowSize;
		if (column !== originalColumn) continue;

		const newPostSize = posts[newI].sizes[0];
		topPx += calculateNewDimensions(newPostSize.width, newPostSize.height, imageWidth).height;
	}

	let { width, height } = calculateNewDimensions(postSize.width, postSize.height, imageWidth);

	return <VisibleImage
		onClick={() => window.open(`https://pixiv.net/artworks/${post.id}`, '_blank')}
		id={post.id}
		alt={`${post.id} - ${enTagsString}`}
		style={{
			position: 'absolute',
			width: width,
			height: height,
			top: topPx,
			left: i % rowSize * imageWidth
		}}
		className="image"
		src={`http://${process.env.REACT_APP_API_IP}/${privateEnabled ? 'private' : 'images'}/${post.id}-0.jpg`}
		title={`${post.id} - ${enTagsString}`}
	/>;
};

export default Image;
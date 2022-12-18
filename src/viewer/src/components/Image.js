import React from 'react';
import { VisibleImage } from 'react-visible-image';
import { useSelector } from 'react-redux';

import { selectPrivateEnabled } from '../slices/posts';
import { selectAllTags } from '../slices/tags';
import { selectAllCurrentPosts } from '../slices/cross';

const calculateNewDimensions = (sourceWidth, sourceHeight, maxWidth) => {
	const ratio = maxWidth / sourceWidth;
	return { width: sourceWidth * ratio, height: sourceHeight * ratio };
};

// @TODO add a seperate image viewer in a right sidebar for singular images, and show all of the image pages

const Image = ({ i, forceLoad, setLoaded }) => {
	const privateEnabled = useSelector(selectPrivateEnabled);
	const tags = useSelector(selectAllTags);
	const posts = useSelector(selectAllCurrentPosts);

	const post = posts[i];
	const enTagsString = post.tags.map(tag => tags[tag]).filter(t => t).join(', ');

	const rowSize = window.innerWidth < 640 ? 3 : 4;
	const imageWidth = window.innerWidth / rowSize;
	const originalColumn = i % rowSize;
	let topPx = 0;

	for (let newI = 0; newI < i; newI++) {
		const column = newI % rowSize;
		if (column !== originalColumn) continue;

		const newPost = posts[newI];
		topPx += calculateNewDimensions(newPost.width, newPost.height, imageWidth).height;
	}

	let { width, height } = calculateNewDimensions(post.width, post.height, imageWidth);

	return <VisibleImage
		forceShow={forceLoad}
		onLoad={() => setLoaded ? setLoaded(true) : null}
		onClick={() => window.open(`https://pixiv.net/artworks/${post.id}`, '_blank')}
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
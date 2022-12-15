import React from 'react';
import { VisibleImage } from 'react-visible-image';
import { useSelector } from 'react-redux';

import { selectAllPosts, selectPrivateEnabled } from '../slices/posts';
import { selectAllTags } from '../slices/tags';

const MemoizedVisibleImage = React.memo(VisibleImage);

const calculateNewDimensions = (sourceWidth, sourceHeight, maxWidth) => {
	const ratio = maxWidth / sourceWidth;
	return { width: sourceWidth * ratio, height: sourceHeight * ratio };
};

// @TODO add a seperate image viewer in the sidebar for singular images, and show all of the image pages

const Image = ({ i, forceLoad, setLoaded }) => {
	const privateEnabled = useSelector(selectPrivateEnabled);
	const tags = useSelector(selectAllTags);
	const posts = useSelector(selectAllPosts);

	const post = posts[i];
	const enTagsString = post.tags.map(tag => tags[tag]).filter(t => t).join(', ');

	const rowSize = 4;
	const imageWidth = window.innerWidth * 0.85 / rowSize;
	const originalColumn = i % rowSize;
	let topPx = 0;

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
			top: topPx,
			left: i % rowSize * (imageWidth) + (window.innerWidth * 0.15)
		}}
		className="image"
		src={`http://${process.env.REACT_APP_API_IP}/${privateEnabled ? 'private' : 'images'}/${post.id}-0.jpg`}
		title={`${post.id} - ${enTagsString}`}
	/>;
};

export default Image;
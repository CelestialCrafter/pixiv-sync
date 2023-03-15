import React from 'react';
import { VisibleImage } from 'react-visible-image';
import { useDispatch, useSelector } from 'react-redux';

import { selectPrivateEnabled, selectAllCurrentPosts, setSelectedPost } from '../slices/posts';

import tags from '../data/tags.json';

const calculateNewDimensions = (sourceWidth, sourceHeight, maxWidth) => {
	const ratio = maxWidth / sourceWidth;
	return { width: sourceWidth * ratio, height: sourceHeight * ratio };
};

// @TODO add a seperate image viewer in a right sidebar for singular images, and show all of the image pages

const Image = ({ i, forceLoad, setLoaded, windowWidth }) => {
	const privateEnabled = useSelector(selectPrivateEnabled);
	const posts = useSelector(selectAllCurrentPosts);
	const dispatch = useDispatch();

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

	const date = post.updateDate.replace(/-/g, '/').replace(/T/g, '/').replace(/:/g, '/').replace(/\+.+/, '');
	// Use this only when you have an extention to set the referer to pixiv.net
	const url = `https://i.pximg.net/img-master/img/${date}/${post.id}_p0_master1200.jpg`;
	// const url = `http://localhost/imgproxy/${date.replace(/\//g, '_')}/${post.id}`;
	const localUrl = `http://${process.env.REACT_APP_API_IP}/${privateEnabled ? 'private' : 'images'}/${post.id}-0.jpg`;
	let { width, height } = calculateNewDimensions(postSize.width, postSize.height, imageWidth);

	// @TODO: add a setting to switch between id copy, url open, ect
	return <VisibleImage
		onClick={() => dispatch(setSelectedPost(post))}
		onDoubleClick={() => false ? navigator.clipboard.writeText(post.id) : window.open(`https://pixiv.net/artworks/${post.id}`, '_blank', 'noreferrer')}
		id={post.id}
		alt={`${post.id} - ${enTagsString}`}
		style={{
			position: 'absolute',
			width,
			height,
			top: topPx,
			left: i % rowSize * imageWidth
		}}
		src={post?.local ? localUrl : url}
		title={`${post.id} - ${enTagsString}`}
	/>;
};

export default Image;
import React, { useEffect, useState } from 'react';
import { VisibleImage } from 'react-visible-image';

const MemoizedVisibleImage = React.memo(VisibleImage);

const calculateNewDimensions = (sourceWidth, sourceHeight, maxWidth) => {
	const ratio = maxWidth / sourceWidth;
	return { width: sourceWidth * ratio, height: sourceHeight * ratio };
};

const Image = ({ posts, i, page, privateImages, forceLoad, setLoaded, tags }) => {
	const post = posts[i];
	const enTagsString = post.tags.map(tag => tags[tag]).filter(t => t).join(', ');
	const [topPx, setTopPx] = useState(0);

	const rowSize = 4;
	const imageWidth = window.innerWidth * 0.85 / rowSize;
	const originalColumn = i % rowSize;
	useEffect(() => {
		let topPxTemp = 0;

		for (let newI = 0; newI < i; newI++) {
			const column = newI % rowSize;
			if (column !== originalColumn) continue;

			const newPost = posts[newI];
			topPxTemp += calculateNewDimensions(newPost.width, newPost.height, imageWidth).height;
		}


		setTopPx(topPxTemp);
	}, [i, imageWidth, originalColumn, posts]);

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
		src={`http://localhost/${privateImages ? 'private' : 'images'}/${post.id}-${page}.jpg`}
		title={`${post.id} - ${enTagsString}`}
	/>
};

export default Image;
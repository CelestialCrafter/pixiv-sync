import React, { useRef, useState } from 'react';

import './JumpTo.css';

const JumpTo = ({ imagesRef }) => {
	const [dropdown, setDropdown] = useState(false);
	const [error, setError] = useState('');
	const jumpToInputRef = useRef();

	return <React.Fragment>
		{dropdown ? <div className="dropdown">
			<input ref={jumpToInputRef} type="text" />
			<button onClick={() => {
				if (!jumpToInputRef.current) return setError('Input not loaded yet');

				const post = document.getElementById(jumpToInputRef.current.value);
				if (!post) return setError('Post ID not found!');

				post.scrollIntoView();
				setError('');
			}}>Jump</button>
			<p>{error}</p>
		</div> : null}
		<button
			onClick={() => setDropdown(prevDropdown => !prevDropdown)}
			onDoubleClick={() => window.scroll(0, 0)}
			className="jump"
		>
			<i className="material-icons">expand_less</i>
		</button>
	</React.Fragment>;
};

export default JumpTo;
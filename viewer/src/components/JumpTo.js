import React, { useEffect, useRef, useState } from 'react';

import './JumpTo.css';

const debounce = (fn, delay) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
};

const JumpTo = ({ imagesRef }) => {
	const [dropdown, setDropdown] = useState(false);
	const [error, setError] = useState('');
	const jumpToInputRef = useRef();

	useEffect(() => {
		const loadedListener = () => {
			const scrollValue = localStorage.getItem('scroll');
			if (scrollValue) window.scroll(0, scrollValue);
			document.removeEventListener('DOMContentLoaded', loadedListener);
		};

		document.addEventListener('DOMContentLoaded', loadedListener);

		const listener = () => localStorage.setItem('scroll', window.scrollY);
		const debouncedListener = debounce(listener, 600);

		window.addEventListener('beforeunload', listener);
		window.addEventListener('scroll', debouncedListener);
		return () => {
			window.removeEventListener('beforeunload', listener);
			window.removeEventListener('scroll', debouncedListener);
		};
	}, []);

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
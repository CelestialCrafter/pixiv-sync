import React, { useEffect, useState } from 'react';

const Slider = ({ onChange, min, max, display }) => {
	const [minSlider, setMinSlider] = useState(min);
	const [maxSlider, setMaxSlider] = useState(max);


	useEffect(() => onChange([minSlider, maxSlider]), [minSlider, maxSlider, onChange]);

	useEffect(() => {
		if (maxSlider > max) setMaxSlider(max);
		if (minSlider < min) setMinSlider(min);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [min, max]);

	return <div style={{ marginTop: 8, marginBottom: 8 }}>
		<span>{display}</span>
		<input type="number" style={{ width: '20%' }} min={min} max={maxSlider} value={minSlider} onChange={e => setMinSlider(Number(e.target.value))} />
		<input type="number" style={{ width: '20%' }} min={minSlider} max={max} value={maxSlider} onChange={e => setMaxSlider(Number(e.target.value))} />
	</div>;
};

export default Slider;

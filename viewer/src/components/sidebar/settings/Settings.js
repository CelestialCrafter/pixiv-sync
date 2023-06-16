import React, { createRef, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectSyncSettings, setSyncData, setSyncSettings } from '../../../slices/sync';
import { selectSortType, selectSortState, nextSortState } from '../../../slices/sort';
import { updateCurrentPosts } from '../../../slices/posts';

import './Settings.css';

const Settings = ({ socket }) => {
	const dispatch = useDispatch();
	const [settingRefs, setSettingsRefs] = useState({});

	const settings = useSelector(selectSyncSettings);

	const sortType = useSelector(selectSortType);
	const sortState = useSelector(selectSortState);

	const handleSubmitSettings = () => {
		let newSettings = {};

		Object.keys(settingRefs).forEach(key => {
			const ref = settingRefs[key];
			if (ref.current) {
				const type = ref.current.getAttribute('type');

				if (type === 'number') newSettings[key] = Number(ref.current.value);
				else if (type === 'checkbox') newSettings[key] = ref.current.checked;
				else if (type === 'text') newSettings[key] = ref.current.value;
			}
		});

		dispatch(setSyncSettings(newSettings));
		socket.emit('setSettings', newSettings);
	};

	const addRefs = useCallback(() => {
		const settingRefs = {};
		Object.keys(settings).forEach(key => settingRefs[key] = createRef());
		setSettingsRefs(settingRefs);
	}, [settings]);

	useEffect(() => {
		socket.on('settings', newSettings => {
			Object.keys(settingRefs).forEach(key => {
				const ref = settingRefs[key];
				if (ref.current) {
					const type = ref.current.getAttribute('type');

					if (type === 'checkbox') ref.current.checked = newSettings[key];
					else ref.current.value = newSettings[key];
				}
				if (ref.current) ref.current.value = newSettings[key];
			});
			dispatch(setSyncSettings(newSettings));
		});
	}, [dispatch, settingRefs, socket]);

	useEffect(() => addRefs(), [addRefs]);

	return <div className="setting">
		{Object.keys(settings).map(key => {
			const type = typeof settings[key];
			let formType = null;
			let style = {};

			if (type === 'number') {
				formType = 'number';
				style = { width: '20%' };
			} else if (type === 'string') {
				formType = 'text';
				style = { width: '40%' };
			} else if (type === 'boolean') formType = 'checkbox';

			return <div key={key}>
				<span>{key}</span>
				<input
					style={style}
					ref={settingRefs[key]}
					type={formType}
					defaultValue={formType !== 'checkbox' ? settings[key] : null}
					defaultChecked={formType === 'checkbox' ? settings[key] : null}
				/>
			</div>;
		})}
		<div>
			<span>{sortType} </span>
			<button onClick={() => {
				dispatch(nextSortState());
				dispatch(updateCurrentPosts());
				/* @TODO make this not reliant on terinaries so i can expand it more */
			}}>{sortState === 0 ? 'Default' : sortState === 1 ? 'Dec' : sortState === 2 ? 'Asc' : 'Random'}</button>
		</div>
		<br />
		<button onClick={() => { handleSubmitSettings(); socket.emit('sync'); }}>Sync</button>
		<button onClick={() => socket.emit('endSync')}>End Sync</button>
		<button onClick={() => dispatch(setSyncData([]))}>Clear Output</button>
	</div>;
};

export default Settings;
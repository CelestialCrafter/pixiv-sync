import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSettings = createAsyncThunk('sync/fetchSettings', async (_arg, { dispatch }) => {
	const settings = await (await fetch(`http://${process.env.REACT_APP_API_IP}/config`)).json();

	return settings;
});

export const syncSlice = createSlice({
	name: 'sync',
	initialState: {
		data: [],
		settings: {},
		status: 'idle',
		error: ''
	},
	reducers: {
		setSyncData: (state, action) => { state.data = action.payload; },
		addSyncData: (state, action) => { state.data.push(action.payload); },
		setSyncSettings: (state, action) => { state.settings = action.payload; }
	},
	extraReducers: builder => {
		builder.addCase(fetchSettings.pending, state => { state.status = 'loading'; })
			.addCase(fetchSettings.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.settings = action.payload;
			})
			.addCase(fetchSettings.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			});
	}
});

export const selectAllSyncData = state => state.sync.data;
export const selectSyncSettings = state => state.sync.settings;

export const {
	setSyncData,
	addSyncData,
	setSyncSettings
} = syncSlice.actions;
export default syncSlice.reducer;

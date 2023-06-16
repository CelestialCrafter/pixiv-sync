import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
	type: 'likes',
	// 0 = Off, 1 = Descending, 2 = Ascending, 3 = Random
	state: 0
};

export const sortSlice = createSlice({
	name: 'sort',
	initialState,
	reducers: {
		setSortType: (state, action) => { state.type = action.payload; },
		setSortState: (state, action) => { state.state = action.payload; },
		nextSortState: state => {
			if (state.state === 3) state.state = 0;
			else state.state++;
		}
	}
});

export const selectSortType = state => state.sort.type;
export const selectSortState = state => state.sort.state;

export const { setSortType, setSortState, nextSortState } = sortSlice.actions;
export default sortSlice.reducer;
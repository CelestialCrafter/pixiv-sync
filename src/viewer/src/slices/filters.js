import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
	width: { min: 0, max: 2400, maxSlider: 2400, minSlider: 0 },
	height: { min: 0, max: 2400, maxSlider: 2400, minSlider: 0 }
};

export const filtersSlice = createSlice({
	name: 'filters',
	initialState,
	reducers: {
		setWidthFilter: (state, action) => {
			state.width.min = action.payload.min;
			state.width.max = action.payload.max;
		},
		setHeightFilter: (state, action) => {
			state.height.min = action.payload.min;
			state.height.max = action.payload.max;
		},
		updateFilters: (state, action) => {
			let maxWidth = 0;
			let minWidth = 2400;

			let maxHeight = 0;
			let minHeight = 2400;

			action.payload.forEach(post => post.sizes.forEach(size => {
				if (size.width < minWidth) minWidth = size.width;
				if (size.width > maxWidth) maxWidth = size.width;

				if (size.width < minHeight) minHeight = size.height;
				if (size.width > maxHeight) maxHeight = size.height;
			}));

			state.width.minSlider = minWidth;
			state.width.maxSlider = maxWidth;

			state.height.minSlider = minHeight;
			state.height.maxSlider = maxHeight;

			if (state.height.max > state.height.maxSlider) state.height.max = state.height.maxSlider;
			if (state.width.max > state.width.maxSlider) state.width.max = state.width.maxSlider;
			if (state.height.min < state.width.minSlider) state.height.min = state.height.minSlider;
			if (state.width.min < state.width.minSlider) state.width.min = state.width.minSlider;
		}
	}
});

export const selectWidthFilter = state => state.filters.width;
export const selectHeightFilter = state => state.filters.height;
export const selectIdFilter = state => state.filters.id;

export const { setWidthFilter, setHeightFilter, setIdFilter, updateFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
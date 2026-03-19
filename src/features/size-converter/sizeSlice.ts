import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SizeState {
  fromUnit: 'px' | 'cm' | 'inch';
  toUnit: 'px' | 'cm' | 'inch';
  value: number;
  width: number;
  height: number;
  dpi: number;
}

const initialState: SizeState = {
  fromUnit: 'px',
  toUnit: 'cm',
  value: 0,
  width: 0,
  height: 0,
  dpi: 96, // default screen DPI
};

const sizeSlice = createSlice({
  name: 'size',
  initialState,
  reducers: {
    setDimensions: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.width = action.payload.width;
      state.height = action.payload.height;
    },
    setUnits: (state, action: PayloadAction<{ from: SizeState['fromUnit']; to: SizeState['toUnit'] }>) => {
      state.fromUnit = action.payload.from;
      state.toUnit = action.payload.to;
    },
    setDpi: (state, action: PayloadAction<number>) => {
      state.dpi = action.payload;
    },
  },
});

export const { setDimensions, setUnits, setDpi } = sizeSlice.actions;
export default sizeSlice.reducer;

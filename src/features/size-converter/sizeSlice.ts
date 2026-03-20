import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface HistoryItem {
  id: string;
  fromValue: string;
  fromUnit: string;
  toValue: string;
  toUnit: string;
  timestamp: number;
}

interface SizeState {
  fromValue: string;
  fromUnit: 'px' | 'cm' | 'inch' | 'mm';
  toUnit: 'px' | 'cm' | 'inch' | 'mm';
  dpi: number;
  history: HistoryItem[];
}

const initialState: SizeState = {
  fromValue: '51',
  fromUnit: 'mm',
  toUnit: 'cm',
  dpi: 300,
  history: [],
};

const sizeSlice = createSlice({
  name: 'size',
  initialState,
  reducers: {
    setFromValue: (state, action: PayloadAction<string>) => {
      state.fromValue = action.payload;
    },
    setFromUnit: (state, action: PayloadAction<SizeState['fromUnit']>) => {
      state.fromUnit = action.payload;
    },
    setToUnit: (state, action: PayloadAction<SizeState['toUnit']>) => {
      state.toUnit = action.payload;
    },
    setDpi: (state, action: PayloadAction<number>) => {
      state.dpi = action.payload;
    },
    addHistory: (state, action: PayloadAction<HistoryItem>) => {
      state.history = [action.payload, ...state.history].slice(0, 10);
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const { setFromValue, setFromUnit, setToUnit, setDpi, addHistory, clearHistory } = sizeSlice.actions;
export default sizeSlice.reducer;

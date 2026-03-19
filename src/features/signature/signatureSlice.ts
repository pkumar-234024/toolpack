import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SignatureState {
  penColor: string;
  penWidth: number;
  history: string[];
  currentIndex: number;
  showGrid: boolean;
}

const initialState: SignatureState = {
  penColor: '#000000',
  penWidth: 2,
  history: [],
  currentIndex: -1,
  showGrid: true,
};

const signatureSlice = createSlice({
  name: 'signature',
  initialState,
  reducers: {
    setPenColor: (state, action: PayloadAction<string>) => {
      state.penColor = action.payload;
    },
    setPenWidth: (state, action: PayloadAction<number>) => {
      state.penWidth = action.payload;
    },
    addToHistory: (state, action: PayloadAction<string>) => {
      // Remove any steps ahead if we draw after undoing
      if (state.currentIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.currentIndex + 1);
      }
      state.history.push(action.payload);
      state.currentIndex++;
      // Basic history limit
      if (state.history.length > 30) {
        state.history.shift();
        state.currentIndex--;
      }
    },
    undo: (state) => {
      if (state.currentIndex >= 0) {
        state.currentIndex--;
      }
    },
    redo: (state) => {
      if (state.currentIndex < state.history.length - 1) {
        state.currentIndex++;
      }
    },
    clearHistory: (state) => {
      state.history = [];
      state.currentIndex = -1;
    },
    toggleGrid: (state) => {
      state.showGrid = !state.showGrid;
    },
  },
});

export const { setPenColor, setPenWidth, addToHistory, undo, redo, clearHistory, toggleGrid } = signatureSlice.actions;
export default signatureSlice.reducer;

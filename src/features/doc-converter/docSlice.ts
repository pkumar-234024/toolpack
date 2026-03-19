import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface DocFile {
  id: string;
  name: string;
  size: number;
  type: string;
  blob: Blob;
  progress: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  convertedBlob?: Blob;
  targetFormat?: string;
}

interface DocState {
  files: DocFile[];
  targetFormat: 'jpg' | 'png' | 'pdf';
  isProcessing: boolean;
}

const initialState: DocState = {
  files: [],
  targetFormat: 'pdf',
  isProcessing: false,
};

const docSlice = createSlice({
  name: 'doc',
  initialState,
  reducers: {
    addFiles: (state, action: PayloadAction<DocFile[]>) => {
      // Logic for adding files – usually via a dedicated helper in a hook
      state.files.push(...action.payload);
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(f => f.id !== action.payload);
    },
    updateFileProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const file = state.files.find(f => f.id === action.payload.id);
      if (file) file.progress = action.payload.progress;
    },
    setTargetFormat: (state, action: PayloadAction<DocState['targetFormat']>) => {
      state.targetFormat = action.payload;
    },
    clearFiles: (state) => {
      state.files = [];
    },
    updateFileStatus: (state, action: PayloadAction<{ id: string; status: DocFile['status']; convertedBlob?: Blob }>) => {
      const file = state.files.find(f => f.id === action.payload.id);
      if (file) {
        file.status = action.payload.status;
        if (action.payload.convertedBlob) file.convertedBlob = action.payload.convertedBlob;
      }
    },
  },
});

export const { addFiles, removeFile, updateFileProgress, setTargetFormat, clearFiles, updateFileStatus } = docSlice.actions;
export default docSlice.reducer;

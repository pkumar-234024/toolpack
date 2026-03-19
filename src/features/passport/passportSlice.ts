import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PassportState {
  image: string | null;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  brightness: number;
  contrast: number;
  paperSize: 'A4' | 'A5' | 'A6' | 'single';
  margin: number;
  spacing: number;
  copies: number;
  bgColor: string;
  showFaceGuide: boolean;
  photoRatio: { width: number; height: number };
  dpi: number;
  selectedPreset: string | null;
}

const initialState: PassportState = {
  image: null,
  crop: { x: 0, y: 0 },
  zoom: 1,
  rotation: 0,
  brightness: 100,
  contrast: 100,
  paperSize: 'A4',
  margin: 10,
  spacing: 5,
  copies: 8,
  bgColor: '#ffffff',
  showFaceGuide: true,
  photoRatio: { width: 5.1, height: 5.1 }, // 5.1cm x 5.1cm (51mm x 51mm)
  dpi: 300,
  selectedPreset: 'India (Visa)',
};

const passportSlice = createSlice({
  name: 'passport',
  initialState,
  reducers: {
    setImage: (state, action: PayloadAction<string | null>) => {
      state.image = action.payload;
    },
    setCrop: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.crop = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setRotation: (state, action: PayloadAction<number>) => {
      state.rotation = action.payload;
    },
    setAdjustment: (state, action: PayloadAction<{ type: 'brightness' | 'contrast'; value: number }>) => {
      state[action.payload.type] = action.payload.value;
    },
    setPaperSize: (state, action: PayloadAction<PassportState['paperSize']>) => {
      state.paperSize = action.payload;
    },
    setSpacing: (state, action: PayloadAction<number>) => {
      state.spacing = action.payload;
    },
    setCopies: (state, action: PayloadAction<number>) => {
      state.copies = action.payload;
    },
    setBgColor: (state, action: PayloadAction<string>) => {
      state.bgColor = action.payload;
    },
    setPhotoRatio: (state, action: PayloadAction<{ width: number; height: number; presetName?: string }>) => {
      state.photoRatio.width = action.payload.width;
      state.photoRatio.height = action.payload.height;
      state.selectedPreset = action.payload.presetName || null;
    },
    toggleFaceGuide: (state) => {
      state.showFaceGuide = !state.showFaceGuide;
    },
    setDPI: (state, action: PayloadAction<number>) => {
      state.dpi = action.payload;
    },
    resetPassport: (state) => {
      return { ...initialState, image: state.image };
    },
  },
});

export const { 
  setImage, setCrop, setZoom, setRotation, setAdjustment, 
  setPaperSize, setSpacing, setCopies, setBgColor, 
  setPhotoRatio, setDPI, toggleFaceGuide, resetPassport 
} = passportSlice.actions;
export default passportSlice.reducer;

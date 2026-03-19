import { configureStore } from '@reduxjs/toolkit';
import passportReducer from '../features/passport/passportSlice';
import signatureReducer from '../features/signature/signatureSlice';
import sizeReducer from '../features/size-converter/sizeSlice';
import docReducer from '../features/doc-converter/docSlice';

export const store = configureStore({
  reducer: {
    passport: passportReducer,
    signature: signatureReducer,
    size: sizeReducer,
    doc: docReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

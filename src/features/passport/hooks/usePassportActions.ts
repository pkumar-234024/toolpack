import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { setImage } from '../passportSlice';
import { removeBackground } from '@imgly/background-removal';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import type { Area } from 'react-easy-crop';
import { generatePassportSnippet } from '../utils/imageUtils';

export const usePassportActions = () => {
  const dispatch = useDispatch();
  const { 
    image, rotation, brightness, contrast, 
    paperSize, spacing, photoRatio, copies, bgColor, dpi
  } = useSelector((state: RootState) => state.passport);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isRemovingBG, setIsRemovingBG] = useState(false);
  const [printImage, setPrintImage] = useState<string | null>(null);
  const [finalPhoto, setFinalPhoto] = useState<string | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const clearImage = useCallback(() => {
    dispatch(setImage(null));
    setPrintImage(null);
    setFinalPhoto(null);
  }, [dispatch]);

  const handleRemoveBG = async () => {
    if (!image) return;
    setIsRemovingBG(true);
    const toastId = toast.loading('Removing background...');
    try {
      const result = await removeBackground(image);
      const reader = new FileReader();
      reader.onload = () => {
        dispatch(setImage(reader.result as string));
        toast.success('Background removed!', { id: toastId });
      };
      reader.readAsDataURL(result);
    } catch (e) { 
      console.error(e);
      toast.error('AI Processing failed. Check your connection.', { id: toastId }); 
    } finally { 
      setIsRemovingBG(false); 
    }
  };

  const handleApplyCrop = async () => {
    if (!image || !croppedAreaPixels) return;
    const toastId = toast.loading('Applying requirements...');
    try {
      const croppedImg = await generatePassportSnippet(
        image, 
        croppedAreaPixels, 
        rotation, 
        bgColor, 
        brightness, 
        contrast, 
        dpi, 
        photoRatio.width * 10, 
        photoRatio.height * 10
      );
      setFinalPhoto(croppedImg);
      toast.success('Requirements applied!', { id: toastId });
    } catch { 
      toast.error('Failed to apply edits'); 
    }
  };

  const handleDownloadPDF = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsGenerating(true);
    const toastId = toast.loading('Generating HD PDF...');
    try {
      const croppedImg = finalPhoto || await generatePassportSnippet(
        image, croppedAreaPixels, rotation, bgColor, brightness, contrast, dpi, photoRatio.width * 10, photoRatio.height * 10
      );
      const pdf = new jsPDF({ 
        orientation: 'p', 
        unit: 'mm', 
        format: paperSize === 'single' ? [photoRatio.width * 10, photoRatio.height * 10] : paperSize 
      });
      
      const photoWidth = photoRatio.width * 10;
      const photoHeight = photoRatio.height * 10;
      
      if (paperSize === 'single') { 
        pdf.addImage(croppedImg, 'JPEG', 0, 0, photoWidth, photoHeight); 
      } else {
        const cols = Math.floor(pdf.internal.pageSize.getWidth() / (photoWidth + spacing));
        const rows = Math.floor(pdf.internal.pageSize.getHeight() / (photoHeight + spacing));
        let count = 0;
        for (let r = 0; r < rows && count < copies; r++) {
          for (let c = 0; c < cols && count < copies; c++) {
            pdf.addImage(
              croppedImg, 
              'JPEG', 
              c * (photoWidth + spacing), 
              r * (photoHeight + spacing), 
              photoWidth, 
              photoHeight
            );
            count++;
          }
        }
      }
      pdf.save(`passport_photo_${Date.now()}.pdf`);
      toast.success('Document ready!', { id: toastId });
    } catch { 
      toast.error('PDF generation failed'); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handlePrint = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsPrinting(true);
    try {
      const imgToUse = finalPhoto || await generatePassportSnippet(
        image, croppedAreaPixels, rotation, bgColor, brightness, contrast, dpi, photoRatio.width * 10, photoRatio.height * 10
      );
      setPrintImage(imgToUse);
      setTimeout(() => { 
        window.print(); 
        setIsPrinting(false); 
      }, 800);
    } catch { 
      setIsPrinting(false); 
    }
  };

  return {
    isRemovingBG, handleRemoveBG, handleApplyCrop, handleDownloadPDF,
    handlePrint, clearImage, onCropComplete,
    isGenerating, isPrinting, printImage, finalPhoto, croppedAreaPixels
  };
};

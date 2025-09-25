// src/utils/ocrUtils.ts

import TextRecognition, { TextRecognitionResult } from '@react-native-ml-kit/text-recognition';
import type { TextElement as LibTextElement, TextLine as LibTextLine, TextBlock as LibTextBlock } from '@react-native-ml-kit/text-recognition';


interface TextElement {
  text: string;
  boundingBox: [number, number, number, number];
}
interface TextLine {
  text: string;
  elements: TextElement[];
}
export interface FinalOcrResult {
  text: string;
  blocks: {
    text: string;
    lines: TextLine[];
  }[];
}

// Tipe kembalian Promise di sini sudah benar
export const recognizeReceiptText = async (imageUri: string): Promise<FinalOcrResult> => {
  if (!imageUri) {
    console.warn("Image URI is empty.");
    return { text: '', blocks: [] };
  }

  try {
    console.log(`Processing image with @react-native-ml-kit/text-recognition...`);
    const resultFromLibrary: TextRecognitionResult = await TextRecognition.recognize(imageUri);

    if (!resultFromLibrary || resultFromLibrary.blocks.length === 0) {
      return { text: '', blocks: [] };
    }

    const adaptedBlocks = resultFromLibrary.blocks.map((block: LibTextBlock) => ({
      text: block.text,
      lines: block.lines.map((line: LibTextLine) => ({
        text: line.text,
        elements: line.elements.map((element: LibTextElement) => {
          
          // PERBAIKAN 1: Cek jika frame ada, dan berikan nilai default jika tidak ada
          const frame = element.frame;
          const boundingBox: [number, number, number, number] = frame
            ? [
                // PERBAIKAN 2: Gunakan nama properti yang benar (left, top)
                frame.left,
                frame.top,
                frame.width,
                frame.height,
              ]
            : [0, 0, 0, 0]; // Nilai default jika frame tidak terdeteksi

          return {
            text: element.text,
            boundingBox: boundingBox,
          };
        }),
      })),
    }));
    
    const finalResult: FinalOcrResult = {
      text: resultFromLibrary.text,
      blocks: adaptedBlocks,
    };

    console.log("OCR Success! Returning the final adapted result.");
    return finalResult;

  } catch (error) {
    console.error('Error during OCR process:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to recognize text: ${error.message}`);
    } else {
      throw new Error('Failed to recognize text: An unknown error occurred.');
    }
  }
};
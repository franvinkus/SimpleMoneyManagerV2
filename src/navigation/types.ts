export type RootStackParamList = {
  Splash: undefined; 
  Home: undefined;   
  Camera: undefined;
  Preview: {photoPath: string},
  OCR: {photoPath: string},
  SCANRESULT: { 
    rawOcrText: string; 
    storeName: string | null;
    extractedDate: string | null;
    extractedTotal: string | null;
    extractedItems: ItemDetail[];
  };
  Calendar: undefined;
  SkiaProcessor: { photoPath: string };
};

export type ItemDetail = {
  name: string;
  quantity?: number; 
  unitPrice?: number; 
  totalItemPrice?: number; 
  rawLine: string;
};
// app/utils/receiptParser.ts
import { ItemDetail } from '../navigation/types';

export interface ParsedReceiptData {
  storeName: string | null;
  date: string | null;
  total: string | null;
  items: ItemDetail[];
}

const findStoreName = (lines: string[]): string => {
    const addressKeywords = ['jl', 'ruko', 'no', 'www.', '.com', 'telp', '(', ')'];
    
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const currentLine = lines[i].trim();
        const lowerCaseLine = currentLine.toLowerCase();
        
        if (!currentLine || /^\d/.test(currentLine) || lowerCaseLine.includes('check no')) {
            continue;
        }

        const containsAddressKeyword = addressKeywords.some(keyword => lowerCaseLine.includes(keyword));
        
        if (!containsAddressKeyword) {
            return currentLine;
        }
    }
    
    return lines.length > 0 ? lines[0].trim() : 'Toko tidak terdeteksi';
}

export const parseReceiptText = (rawText: string): ParsedReceiptData => {
  const lines = rawText.split('\n');
  const items: ItemDetail[] = [];
  
  let date: string | null = null;
  let total: string | null = null;
  
  let isItemSection = false;
  
  const itemSectionStartTriggers = ['check no'];
  const itemSectionEndTriggers = ['subtotal', 'total', 'payment'];
  
  const dateRegex = /(\d{1,2}\s[a-zA-Z]{3,9}\s\d{2,4})|(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/;
  const totalRegex = /total\s*:?\s*([\d,.]+)/i;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    const lowerCaseLine = trimmedLine.toLowerCase();

    if (itemSectionEndTriggers.some(keyword => lowerCaseLine.startsWith(keyword))) {
      isItemSection = false;
    }

    if (isItemSection) {
      if (dateRegex.test(trimmedLine)) {
        if (!date) {
          const dateMatch = trimmedLine.match(dateRegex);
          date = dateMatch ? (dateMatch[1] || dateMatch[2]) : null;
        }
        continue;
      }
      
      const itemLineRegex = /^(\d+)\s+(.*)/;
      const match = trimmedLine.match(itemLineRegex);

      if (match) {
        const quantity = parseInt(match[1], 10);
        const restOfLine = match[2];
        const numbers = restOfLine.match(/[\d.,]+/g) || [];
        const lastItem = items.length > 0 ? items[items.length - 1] : null;

        if (numbers.length > 0) {
          // KASUS 1: Baris ini memiliki harga.
          const priceString = numbers[0]!;
          const price = parseFloat(priceString.replace(/[.,]/g, ''));
          const priceIndex = restOfLine.indexOf(priceString);
          const name = restOfLine.substring(0, priceIndex).trim();

          if (name && !isNaN(price)) {
            items.push({ name, quantity, totalItemPrice: price, rawLine: trimmedLine });
          }
          
          // Jika ada harga kedua di baris yang sama, buat "placeholder" untuk itu.
          if (numbers.length > 1) {
            const leftoverPriceString = numbers[1]!;
            const leftoverPrice = parseFloat(leftoverPriceString.replace(/[.,]/g, ''));
            if (!isNaN(leftoverPrice)) {
              items.push({ name: 'PLACEHOLDER', quantity: 1, totalItemPrice: leftoverPrice, rawLine: '' });
            }
          }
        } else {
          // KASUS 2: Baris ini TIDAK memiliki harga (hanya nama).
          const name = restOfLine.trim();
          
          // Cek apakah item terakhir adalah placeholder yang menunggu nama ini.
          if (lastItem && lastItem.name === 'PLACEHOLDER') {
            // Jika ya, perbarui placeholder tersebut dengan nama yang benar.
            lastItem.name = name;
            lastItem.quantity = quantity;
            lastItem.rawLine = trimmedLine;
          }
        }
      }
    } else {
      if (!date) {
        const dateMatch = trimmedLine.match(dateRegex);
        date = dateMatch ? (dateMatch[1] || dateMatch[2]) : date;
      }
      const totalMatch = lowerCaseLine.match(totalRegex);
      if (totalMatch && totalMatch[1]) {
        total = totalMatch[1].replace(/[.,]/g, '');
      }
    }

    if (itemSectionStartTriggers.some(keyword => lowerCaseLine.includes(keyword))) {
      isItemSection = true;
    }
  }

  const storeName = findStoreName(lines);

  // Safeguard: Hapus placeholder yang mungkin tidak terisi
  const finalItems = items.filter(item => item.name !== 'PLACEHOLDER');

  return { storeName, date, total, items: finalItems };
};


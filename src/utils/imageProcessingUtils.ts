// import { getColors } from 'react-native-image-colors';
// import { Platform } from 'react-native';

// // --- PERBAIKAN DI SINI: Import semua sebagai satu objek ---
// import * as ImageManipulator from 'react-native-image-manipulator';
// // --- AKHIR PERBAIKAN ---

// // --- Konfigurasi Ambang Batas dan Jumlah Penyesuaian ---
// const BRIGHTNESS_THRESHOLD = 80;
// const BRIGHTNESS_ADJUSTMENT_AMOUNT = 1.3;
// const DARK_THRESHOLD = 50;
// const DARK_ADJUSTMENT_AMOUNT = 1.5;
// const LIGHT_THRESHOLD = 220;
// const LIGHT_ADJUSTMENT_AMOUNT = 0.7;

// export const preprocessImageForOCR = async (imagePath: string): Promise<string> => {
//     console.log("Starting image preprocessing with manipulator for:", imagePath);
    
//     const imageUri = `file://${imagePath}`;

//     try {
//         const colors = await getColors(imageUri, {});
//         let luminance = 0;

//         const dominantColor = colors.platform === 'android' || colors.platform === 'ios' ?
//             (colors as any).dominant?.rgb || (colors as any).average?.rgb :
//             null;

//         if (dominantColor && dominantColor.length === 3) {
//             luminance = (dominantColor[0] * 0.299 + dominantColor[1] * 0.587 + dominantColor[2] * 0.114);
//         } else {
//             console.warn("Could not determine dominant color. Skipping brightness adjustment.");
//             return imagePath;
//         }

//         console.log(`[PREPROCESS] Detected luminance: ${luminance.toFixed(2)}`);

//         let adjustmentAmount = 1;
//         let needsAdjustment = false;
        
//         if (luminance < DARK_THRESHOLD) {
//             console.log("[PREPROCESS] Image is too dark. Applying strong adjustment.");
//             adjustmentAmount = DARK_ADJUSTMENT_AMOUNT;
//             needsAdjustment = true;
//         } else if (luminance < BRIGHTNESS_THRESHOLD) {
//             console.log("[PREPROCESS] Image is low-light. Applying moderate adjustment.");
//             adjustmentAmount = BRIGHTNESS_ADJUSTMENT_AMOUNT;
//             needsAdjustment = true;
//         } else if (luminance > LIGHT_THRESHOLD) {
//             console.log("[PREPROCESS] Image is overexposed. Applying darkening filter.");
//             adjustmentAmount = LIGHT_ADJUSTMENT_AMOUNT;
//             needsAdjustment = true;
//         }

//         if (needsAdjustment) {
//             console.log(`[PREPROCESS] Applying brightness, contrast, and grayscale filters.`);
            
//             // Gabungkan beberapa aksi manipulasi dalam satu array
//             const actions = [
//                 { brightness: adjustmentAmount }, // Terapkan penyesuaian kecerahan
//                 { contrast: 1.2 },               // Tingkatkan kontras sedikit (nilai > 1)
//                 { grayscale: 1 }                 // Ubah menjadi hitam-putih (nilai 1)
//             ];

//             const result = await ImageManipulator.manipulateAsync(
//                 imageUri,
//                 actions, // Gunakan array aksi yang baru
//                 { format: ImageManipulator.SaveFormat.JPEG, compress: 0.9 } // Kompresi 0.9 untuk kualitas baik
//             );
            
//             console.log("[PREPROCESS] Adjustment finished. New image path:", result.uri);
//             return result.uri.replace('file://', '');
//         }


//         return imagePath;
//     } catch (error) {
//         console.error('Error during image preprocessing:', error);
//         return imagePath;
//     }
// };
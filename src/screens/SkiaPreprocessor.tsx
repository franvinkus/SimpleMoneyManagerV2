// src/screens/SkiaProcessor.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// PERBAIKAN 1: Import NativeStackNavigationProp untuk tipe yang benar
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import RNFS from 'react-native-fs';
import { Canvas, Image, useImage, ColorMatrix, useCanvasRef, Skia, ImageFormat } from '@shopify/react-native-skia';

const BRIGHTNESS_THRESHOLD = 80;
const LIGHT_THRESHOLD = 200;

type SkiaProcessorScreenProps = NativeStackScreenProps<RootStackParamList, 'SkiaProcessor'>;

const SkiaProcessor: React.FC<SkiaProcessorScreenProps> = ({ route }) => {
    const { photoPath } = route.params;
    // PERBAIKAN 1 (Lanjutan): Beri tipe yang spesifik pada useNavigation
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [statusText, setStatusText] = useState('Memulai proses...');
    const [brightnessFactor, setBrightnessFactor] = useState<number | null>(null);

    const canvasRef = useCanvasRef();
    const imageUri = `file://${photoPath}`;
    const image = useImage(imageUri);

    useEffect(() => {
        const processImage = async () => {
            try {
                const imageUri = `file://${photoPath}`;

                // TAHAP 1: Muat gambar secara manual
                setStatusText('Memuat data gambar...');
                const imageData = await Skia.Data.fromURI(imageUri);
                const image = Skia.Image.MakeImageFromEncoded(imageData);
                 if (image === null) {
                console.log("❌ Skia gagal decode gambar:", imageUri);
                } else {
                console.log("✅ Skia berhasil load gambar:", imageUri, image.width(), image.height());
                }

                if (!image) throw new Error('Gagal memuat gambar ke Skia.');

                // TAHAP 2: Deteksi Brightness
                setStatusText('Mendeteksi kecerahan...');
                const surface1x1 = Skia.Surface.Make(1, 1)!;
                const canvas1x1 = surface1x1.getCanvas();
                const paint1x1 = Skia.Paint();
                canvas1x1.drawImageRect(image, { x: 0, y: 0, width: image.width(), height: image.height() }, { x: 0, y: 0, width: 1, height: 1 }, paint1x1);
                const snapshot1x1 = surface1x1.makeImageSnapshot();
                const pixel = snapshot1x1.readPixels();

                let brightnessFactor = 1.0;
                if (pixel) {
                    const [r, g, b] = Array.from(pixel);
                    const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
                    if (luminance < BRIGHTNESS_THRESHOLD) brightnessFactor = 1.4;
                    else if (luminance > LIGHT_THRESHOLD) brightnessFactor = 0.7;
                }

                if (brightnessFactor === 1.0) {
                    navigation.replace("OCR", { photoPath });
                    return;
                }

                // TAHAP 3: Terapkan Filter & Simpan
                setStatusText('Menerapkan filter...');
                const mainSurface = Skia.Surface.Make(image.width(), image.height())!;
                const mainCanvas = mainSurface.getCanvas();
                const paint = Skia.Paint();
                const brightness = 1.0; // 1.0 = normal, >1 = lebih terang, <1 = lebih gelap
                let contrast = 1.0;
                let offset = 0;

                if (brightnessFactor > 1.0) {
                // Gambar gelap → tambahin brightness
                    contrast = 3.5
                    offset = 0;
                    paint.setColorFilter(Skia.ColorFilter.MakeMatrix([
                        contrast, 0, 0, 0, offset,
                        0, contrast, 0, 0, offset,
                        0, 0, contrast, 0, offset,
                        0, 0, 0, 1, 0,
                    ]));
                } else if (brightnessFactor < 1.0) {
                // Gambar terlalu terang → gelapin
                    contrast = 1.5;  
                    offset = 0;
                    brightnessFactor = 0.3;
                    paint.setColorFilter(Skia.ColorFilter.MakeMatrix([
                        contrast * brightnessFactor, 0, 0, 0, offset,
                        0, contrast * brightnessFactor, 0, 0, offset,
                        0, 0, contrast * brightnessFactor, 0, offset,
                        0, 0, 0, 1, 0,
                    ]));
                } else {
                // Normal
                contrast = 1.2;
                offset = 0;
                }
                mainCanvas.drawImage(image, 0, 0, paint);

                const finalSnapshot = mainSurface.makeImageSnapshot();
                // Ganti tujuan ke direktori dokumen yang lebih stabil
                const newPath = `${RNFS.CachesDirectoryPath}/${Date.now()}.jpeg`;
                console.log("newPath: ", newPath);
                const base64Data = finalSnapshot.encodeToBase64(ImageFormat.JPEG, 100);
                await RNFS.writeFile(newPath, base64Data, 'base64');
                const finalPath = `file://${newPath}`; 
                navigation.replace("OCR", { photoPath: finalPath });
                console.log("finalPath: ", finalPath);

            } catch (e) {
                console.error("Gagal memproses gambar:", e);
                navigation.replace("OCR", { photoPath });
            }
        };

        processImage();
    }, [photoPath, navigation]);

    return (
        <View style={styles.container}>
            <Canvas style={styles.hiddenCanvas} ref={canvasRef}>
                {image && (
                    <Image image={image} x={0} y={0} width={image.width()} height={image.height()} fit="contain">
                        <ColorMatrix matrix={[
                            brightnessFactor || 1.0, 0, 0, 0, 0,
                            0, brightnessFactor || 1.0, 0, 0, 0,
                            0, 0, brightnessFactor || 1.0, 0, 0,
                            0, 0, 0, 1, 0,
                        ]}/>
                    </Image>
                )}
            </Canvas>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>{statusText}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 20, color: 'white', fontSize: 16 },
    hiddenCanvas: { display: 'none' },
});

export default SkiaProcessor;
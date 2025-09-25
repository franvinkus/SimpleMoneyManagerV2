import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// CATATAN: Import di bawah ini diasumsikan ada di proyek Anda.
import { RootStackParamList } from '../../navigation/types';
import { recognizeReceiptText } from '../../utils/ocrUtils';
import { parseReceiptText } from '../../utils/receiptParser';
import { preprocessImageForOCR } from '../../utils/imageProcessingUtils';

// Interface untuk logika perangkaian teks per elemen
interface TextElement {
  text: string;
  boundingBox: [number, number, number, number]; 
}

interface TextLine {
  elements: TextElement[];
  text: string;
}

interface TextBlock {
  lines: TextLine[];
}

const OcrScreen = () => {
    const Navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { photoPath } = route.params as { photoPath: string };

    const [resultText, setResultText] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOCR = async () => {
        setIsLoading(true);
        setResultText(null);
        try {

            // const preprocessedPath = await preprocessImageForOCR(photoPath);

            const mlKitResult = await recognizeReceiptText(photoPath);

            if (mlKitResult && mlKitResult.blocks && mlKitResult.blocks.length > 0) {
                const allElements: TextElement[] = [];
                for (const block of mlKitResult.blocks) {
                    for (const line of block.lines) {
                        // Pastikan line.elements ada sebelum di-spread
                        if (line.elements) {
                            allElements.push(...line.elements);
                        }
                    }
                }

                const groupedLines = new Map<number, TextElement[]>();
                const Y_TOLERANCE = 10; // Toleransi untuk mengelompokkan elemen dalam baris yang sama

                allElements.forEach(element => {
                    const yPos = element.boundingBox[1];
                    let foundGroup = false;
                    for (const key of groupedLines.keys()) {
                        if (Math.abs(key - yPos) < Y_TOLERANCE) {
                            const lineElements = groupedLines.get(key);
                            if(lineElements) {
                                lineElements.push(element);
                            }
                            foundGroup = true;
                            break;
                        }
                    }
                    if (!foundGroup) {
                        groupedLines.set(yPos, [element]);
                    }
                });

                const sortedLines = Array.from(groupedLines.entries())
                    .sort((a, b) => a[0] - b[0]) // Urutkan baris dari atas ke bawah
                    .map(([, elements]) =>
                        elements
                            .sort((a, b) => a.boundingBox[0] - b.boundingBox[0]) // Urutkan elemen per baris dari kiri ke kanan
                            .map(el => el.text)
                            .join(' ')
                    );

                const reconstructedText = sortedLines.join('\n');
                setResultText(reconstructedText);

            } else {
                setResultText(mlKitResult.text || 'Tidak ada teks yang dapat dideteksi.');
            }
        } catch (error) {
            Alert.alert('OCR Gagal', `Terjadi kesalahan: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = () => {
        if (!resultText) return;
        const parsedData = parseReceiptText(resultText);
        Navigate.navigate("SCANRESULT", {
            rawOcrText: resultText,
            storeName: parsedData.storeName,
            extractedDate: parsedData.date,
            extractedTotal: parsedData.total,
            extractedItems: parsedData.items,
        });
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => Navigate.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        {photoPath && (
          <Image source={{ uri: 'file://' + photoPath }} style={styles.image} resizeMode="contain" />
        )}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.button} onPress={handleOCR} disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Memproses...' : 'Scan Struk Ini'}
            </Text>
          </TouchableOpacity>
          {isLoading && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}
          {resultText && (
            <ScrollView style={styles.resultScrollView}>
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>Hasil Teks OCR:</Text>
                <Text style={styles.resultText}>{resultText}</Text>
                <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                  <Text style={{ color: 'white', fontSize: 24 }}>✔️</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black', justifyContent: 'space-between' },
    backButton:{ zIndex: 10, position: 'absolute', padding: 20, backgroundColor: "rgba(248, 206, 168, 0.8)", top: 40, borderRadius: 10, left: 20 },
    backText:{ fontSize: 15, fontWeight: 'bold' },
    image:{ flex: 1, width: "100%", height: "60%" },
    bottomContainer: { padding: 20, backgroundColor: '#1c1c1c', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    button: { backgroundColor: '#F8CEA8', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { fontSize: 18, fontWeight: '600', color: '#333' },
    resultScrollView: { maxHeight: 200, marginTop: 20 },
    resultBox: { backgroundColor: '#2a2a2a', padding: 15, borderRadius: 10, position: 'relative' },
    resultTitle: { color: '#F8CEA8', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    resultText: { color: 'white', fontSize: 14, fontFamily: 'monospace', },
    acceptButton: { position: 'absolute', bottom: 15, right: 15, padding: 15, backgroundColor: '#000000aa', borderRadius: 30 },
});

export default OcrScreen;


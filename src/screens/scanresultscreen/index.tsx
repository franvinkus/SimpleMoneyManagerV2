import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import { RootStackParamList, ItemDetail } from '../../navigation/types'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { saveTransaction } from '../../utils/transactionStorage';

type ScanResultScreenRouteProp = RouteProp<RootStackParamList, 'SCANRESULT'>;

type ScanResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SCANRESULT'>;

const ScanResultScreen = () => {
  const route = useRoute<ScanResultScreenRouteProp>();
  // Terapkan tipe yang sudah dibuat ke useNavigation()
  const navigation = useNavigation<ScanResultScreenNavigationProp>();

  const {
    storeName: initialStoreName,
    extractedDate: initialExtractedDate,
    extractedTotal: initialExtractedTotal,
    extractedItems: initialExtractedItems,
    rawOcrText,
  } = route.params;

  const [storeName, setStoreName] = useState(initialStoreName || 'Toko tidak terdeteksi');
  const [editableDate, setEditableDate] = useState(initialExtractedDate || 'N/A');
  const [editableTotal, setEditableTotal] = useState(initialExtractedTotal || 'N/A');
  const [editableItems, setEditableItems] = useState<ItemDetail[]>(initialExtractedItems || []);
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const newTransaction = {
      storeName: storeName,
      date: editableDate,
      total: editableTotal,
      items: editableItems,
    };

    try {
      await saveTransaction(newTransaction);
  
      Alert.alert(
        'Sukses', 
        'Transaksi berhasil disimpan!', 
        [ 
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Calendar') 
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan transaksi.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{storeName}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Transaksi</Text>
          <Text style={styles.dataText}>Tanggal: {editableDate}</Text>
          <Text style={styles.dataText}>Total Belanja: Rp {editableTotal}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daftar Barang</Text>
          {editableItems.length > 0 ? (
            editableItems.map((item, index) => (
              <View key={index} style={styles.item}>
                <Text>{item.quantity?.toString() || 'N/A'}x</Text>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  Rp {item.totalItemPrice?.toLocaleString('id-ID') || 'N/A'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.dataText}>Tidak ada barang yang terdeteksi.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teks Mentah Hasil OCR</Text>
          <Text style={styles.rawText}>{rawOcrText || 'Tidak ada teks.'}</Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  dataText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginHorizontal: 10,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '500',
    color: '#007BFF',
  },
  rawText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});

export default ScanResultScreen;

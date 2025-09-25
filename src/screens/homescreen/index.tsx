import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import BottomBar from "../../components/BottomBar";
import { useModal } from '../../context/modalContext';
import InputManualTransaction from '../../components/modals/InputManualTransaction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteTransaction, getTransactions, saveTransaction, Transaction } from '../../utils/transactionStorage';
import { TransactionType } from '../../context/ModalContext';
import { useFocusEffect } from '@react-navigation/native';
import DailyView from '../calendarscreen/components/dailyView';
const BALANCE_STORAGE_KEY = 'user_initial_balance';

export interface DailyData {
  id: string; 
  storeName: string | null;
  date: Date;
  total: number;
  type: 'income' | 'expense';
  details: {
    itemName: string;
    itemPrice: number;
  }[];
}

const HomeScreen = () => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const {
    requestManualTransactionModal,
    registerManualTransactionHandler,
    unregisterManualTransactionHandler,
    isManualTransactionModalRequested,
    onManualTransactionModalClose,
    onManualTransactionModalSubmit,
  } = useModal();

  const parseDateString = (dateStr: string | null): Date => {
    if (!dateStr) return new Date();

    const monthMap: { [key: string]: string } = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
        januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
        juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12'
    };

    const cleanedDateStr = dateStr.toLowerCase().replace(/[,.]/g, '');
    const parts = cleanedDateStr.split(/[\s-/]/); 
    if (parts.length === 3) {
        let [day, month, year] = parts;

        
        if (isNaN(parseInt(month, 10))) {
            month = monthMap[month.substring(0, 3)];
        }

       
        if (month && month.length === 1) month = '0' + month;
        if (day && day.length === 1) day = '0' + day;

      
        if (year && year.length === 2) year = '20' + year;

       
        const dateFormats = [`${year}-${month}-${day}`, `${year}-${day}-${month}`];
        for (const format of dateFormats) {
            const date = new Date(format);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }

    const directParse = new Date(dateStr);
    if (!isNaN(directParse.getTime())) {
        return directParse;
    }

    return new Date(); 
};

  const loadTransactions = async () => {
        const data = await getTransactions();
        setAllTransactions(data);
    };

  useFocusEffect(
        React.useCallback(() => {
            loadTransactions();
        }, [])
    );

   const { formattedData, netBalance } = useMemo(() => {
      let balance = 0;
      const mappedData = allTransactions.map(transaction => {
        const amount = parseFloat(transaction.total.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
        if (transaction.type === 'income') {
          balance += amount;
        } else {
          balance -= amount;
        }
        return {
          id: transaction.id, 
          storeName: transaction.storeName,
          date: parseDateString(transaction.date), 
          total: amount,
          type: transaction.type, // Tambahkan type ke DailyData
          details: transaction.items.map(item => ({
            itemName: item.name,
            itemPrice: item.totalItemPrice || 0,
          })),
        };
      }).sort((a, b) => b.date.getTime() - a.date.getTime()); 
      return { formattedData: mappedData, netBalance: balance };
    }, [allTransactions]);

    const latestTransactions = useMemo(() => {
        return formattedData.slice(0, 3);
    }, [formattedData]);

  const handleDelete = async (idToDelete: string) => {
      await deleteTransaction(idToDelete);
      await loadTransactions();
  };


 const handleManualTransaction = useCallback(async (amount: number, type: TransactionType) => {
        const newTransaction: Omit<Transaction, 'id'> = {
            storeName: 'Transaksi Manual',
            date: new Date().toISOString(),
            total: amount.toString(), // Simpan amount sebagai string
            items: [],
            type: type
        };
        await saveTransaction(newTransaction);
        await loadTransactions(); // Muat ulang data setelah simpan
        Alert.alert("Konfirmasi", `Transaksi ${type} berhasil. Saldo Anda diperbarui.`);
    }, []);


  useEffect(() => {
    registerManualTransactionHandler(handleManualTransaction);
    return () => {
      unregisterManualTransactionHandler(handleManualTransaction);
    };
  }, [handleManualTransaction, registerManualTransactionHandler, unregisterManualTransactionHandler]);


  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
          <View style={styles.container}>
            <Text style={styles.title}>Welcome to MaNey</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.netBalanceTitle}>Net Balance</Text>
              <Text style={styles.netBalanceAmount}>
                Rp {netBalance.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            <Text style={styles.recentTransactionsTitle}>Transaksi Terbaru</Text>
            <View style={styles.latestTransactionsContainer}>
                {latestTransactions.length === 0 ? (
                    <Text style={styles.emptyText}>Belum ada transaksi.</Text>
                ) : (
                    latestTransactions.map((data) => (
                        <DailyView 
                            key={data.id} 
                            {...data} 
                            onDelete={handleDelete} 
                        />
                    ))
                )}
              </View>
          </View>
        </ScrollView>

        {isManualTransactionModalRequested && (
          <InputManualTransaction
            isInvisible={true}
            onClose={onManualTransactionModalClose}
            onConfirm={onManualTransactionModalSubmit}
          />
        )}

      </SafeAreaView>
      <BottomBar />
    </View>

  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8CEA8', // Latar belakang Home Screen
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center', // Pusatkan konten secara vertikal
    alignItems: 'center',     // Pusatkan konten secara horizontal
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#263238',
  },
  subtitle: {
    fontSize: 18,
    color: '#455a64',
    textAlign: 'center',
    marginBottom: 30,
  },
  balanceContainer: {
    backgroundColor: '#FFEACF',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
    marginTop: 20,
    width: '100%',
  },
  netBalanceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
    textAlign: 'left',
  },
  netBalanceAmount: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  recentTransactionsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 30,
        marginBottom: 10,
        color: '#263238',
        alignSelf: 'flex-start',
  },
  latestTransactionsContainer: {
      width: '100%',
  },
  emptyText: { 
    marginTop: 50, 
    color: 'grey', 
    fontSize: 16 
  },
});

export default HomeScreen;
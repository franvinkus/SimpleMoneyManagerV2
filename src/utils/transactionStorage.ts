import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemDetail } from '../navigation/types'; 
import { TransactionType } from '../context/ModalContext';

const TRANSACTIONS_KEY = '@transactions_data';

export interface Transaction {
  type: TransactionType;
  id: string;
  storeName: string | null;
  date: string | null;
  total: string;
  items: ItemDetail[];
}

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to fetch transactions.', e);
    return [];
  }
};

export const saveTransaction = async (newTransaction: Omit<Transaction, 'id'>): Promise<void> => {
  try {
    const existingTransactions = await getTransactions();
    const transactionWithId: Transaction = {
      ...newTransaction,
      id: Date.now().toString() + Math.random().toString(), 
      storeName: newTransaction.storeName || 'Transaksi Manual',
      items: newTransaction.items || [],
      date: newTransaction.date || new Date().toISOString()
    };
    const updatedTransactions = [...existingTransactions, transactionWithId];
    const jsonValue = JSON.stringify(updatedTransactions);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, jsonValue);
    console.log('[STORAGE] Transaksi berhasil disimpan:', transactionWithId);
  } catch (e) {
    console.error('Failed to save the transaction.', e);
  }
};


export const deleteTransaction = async (idToDelete: string): Promise<void> => {
  try {
    const existingTransactions = await getTransactions();
    const updatedTransactions = existingTransactions.filter(
      (transaction) => transaction.id !== idToDelete
    );
    const jsonValue = JSON.stringify(updatedTransactions);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to delete the transaction.', e);
  }
};

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import BottomBar from "../../components/BottomBar";
import CalendarHeader from "./components/calendarHeader";
import DailyView from "./components/dailyView";
import MonthlyView from "./components/monthlyView";
import { getTransactions, deleteTransaction, Transaction, saveTransaction } from "../../utils/transactionStorage";
import { TransactionType, useModal } from "../../context/modalContext";
import InputManualTransaction from "../../components/modals/InputManualTransaction";

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

const CalendarScreen = () => {
    const [currentView, setCurrentView] = useState<'daily' | 'monthly'>('daily');
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);

    const {
        isManualTransactionModalRequested,
        onManualTransactionModalClose,
        onManualTransactionModalSubmit,
        registerManualTransactionHandler,
        unregisterManualTransactionHandler,
    } = useModal();

    const loadData = async () => {
        const data = await getTransactions();
        setAllTransactions(data);
    };

    const handleManualTransaction = useCallback(async (amount: number, type: TransactionType, date: Date) => {
        const newTransaction: Omit<Transaction, 'id'> = {
            storeName: 'Transaksi Manual',
            date: date.toISOString(),
            total: amount.toString(),
            items: [], // Transaksi manual tidak punya detail item
            type: type
        };
        await saveTransaction(newTransaction); 
        await loadData(); 
        Alert.alert("Konfirmasi", `Transaksi ${type === 'income' ? 'pemasukan' : 'pengeluaran'} berhasil. Jumlah: Rp ${amount.toLocaleString('id-ID')}`);
    }, []);

    useEffect(() => {
        registerManualTransactionHandler(handleManualTransaction);
        return () => {
            unregisterManualTransactionHandler(handleManualTransaction);
        };
    }, [handleManualTransaction, registerManualTransactionHandler, unregisterManualTransactionHandler]);

    useFocusEffect(
      React.useCallback(() => {
        loadData();
      }, [])
    );

    const handleDelete = async (idToDelete: string) => {
        await deleteTransaction(idToDelete);
  
        loadData(); 
    };

    const formattedData: DailyData[] = useMemo(() => {
      let incomeSum = 0;
      let expenseSum = 0;

      const mappedData = allTransactions.map(transaction => {
        const amount = parseFloat(transaction.total.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
        if (transaction.type === 'income') {
            incomeSum += amount;
        } else {
            expenseSum += amount;
        }

        return {
          id: transaction.id, 
          storeName: transaction.storeName,
          date: parseDateString(transaction.date), 
          total: amount, 
          details: transaction.items.map(item => ({
            itemName: item.name,
            itemPrice: item.totalItemPrice || 0,
          })),
          type: transaction.type,
        };
      }).sort((a, b) => b.date.getTime() - a.date.getTime()); 


      setTotalIncome(incomeSum);
      setTotalExpenses(expenseSum);

      return mappedData;
    }, [allTransactions]); 

    const monthlyData = useMemo(() => {
        const groupedByMonth: { [key: string]: DailyData[] } = {};
        formattedData.forEach(data => {
            const monthKey = `${data.date.getFullYear()}-${data.date.getMonth()}`;
            if (!groupedByMonth[monthKey]) {
                groupedByMonth[monthKey] = [];
            }
            groupedByMonth[monthKey].push(data);
        });

       
        const monthlySummaries = Object.keys(groupedByMonth).map(monthKey => {
            const monthData = groupedByMonth[monthKey];
            const firstDayOfMonth = new Date(monthData[0].date.getFullYear(), monthData[0].date.getMonth(), 1);
            
            return {
                date: firstDayOfMonth, 
                details: monthData, 
            };
        }).sort((a, b) => b.date.getTime() - a.date.getTime()); 

        // Asumsi kita hanya menampilkan bulan saat ini atau beberapa bulan terakhir
        // Untuk demo, kita ambil bulan pertama yang ada (bulan terbaru)
        return monthlySummaries.length > 0 ? monthlySummaries[0] : { date: new Date(), details: [] };
    }, [formattedData]);
    
    return (
        <View style={{flex: 1}}>
            <CalendarHeader
              currentView={currentView}
              onViewChange={setCurrentView}
              expenses={totalExpenses}
              income={totalIncome}
            />
            <View style={{flex: 1}}>
                <SafeAreaView style={[styles.safeViewArea]}>
                    <ScrollView contentInsetAdjustmentBehavior="automatic">
                        <View style={[styles.container]}>
                            {formattedData.length === 0 ? (
                                <Text style={styles.emptyText}>Belum ada transaksi.</Text>
                            ) : currentView === 'daily' ? (
                                <View style={[styles.dataContainer]}>
                                    {formattedData.map((data) => (
                                        <DailyView 
                                            key={data.id} 
                                            {...data} 
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </View>
                            ) : (
                                <View style={[styles.dataContainer]}>
                                    <MonthlyView date={new Date()} details={formattedData}/>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View> 
            <BottomBar/>
            {isManualTransactionModalRequested && (
                <InputManualTransaction
                    isInvisible={true}
                    onClose={onManualTransactionModalClose}
                    onConfirm={onManualTransactionModalSubmit}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    safeViewArea:{ 
        flex:1, 
        backgroundColor: '#F8CEA8',
    },
    container:{ 
        alignItems: "center", 
        alignContent: "center" 
    },
    dataContainer:{ 
        width: "90%" 
    },
    emptyText: { 
        marginTop: 50, 
        color: 'grey', 
        fontSize: 16 
    },
})

export default CalendarScreen;

import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";

interface propsDetail{
    itemName: string,
    itemPrice: number,
}

interface dailyProps{
    id: string; 
    storeName: string | null; 
    date: Date,
    total: number,
    details: propsDetail[],
    onDelete: (id: string) => void; 
    type: 'income' | 'expense';
}

const DailyView = ({ id, storeName, date, total, details, onDelete, type }: dailyProps) => {

    const formattedDate = date.toLocaleDateString('id-ID', {
      weekday: 'long', 
      day: 'numeric',  
      month: 'long',    
      year: 'numeric',  
    });

   
    const handleDeletePress = () => {
        Alert.alert(
            "Hapus Transaksi",
            "Apakah Anda yakin ingin menghapus transaksi ini?", 
            [
               
                { 
                    text: "Batal", 
                    style: "cancel" 
                },
                
                { 
                    text: "Hapus", 
                    onPress: () => onDelete(id), 
                    style: "destructive" 
                }
            ]
        );
    };

    return(
        <View style={[styles.background]}>
            <View style={[styles.container]}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.storeName]}>{storeName}</Text>
                    <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.textHeader]}>
                    <Text style={[styles.textDate]}>{formattedDate}</Text>
                    <Text style={[styles.textTotal, type === 'expense' ? styles.negativeAmount : styles.positiveAmount]}>Rp. {total.toLocaleString('id-ID')}</Text>
                </View>

                <View style={styles.divider} />

                {details.map((item, index) => (
                    <View key={index} style={[styles.details]}>
                        <Text style={[styles.itemName]}>{item.itemName}</Text>
                        <Text style={[styles.itemPrice]}>Rp. {item.itemPrice.toLocaleString('id-ID')}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    background:{
        backgroundColor: 'white',
        borderRadius: 10,
        marginTop: 15,
        width: "100%",
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        marginBottom: 10,
    },
    container:{
        padding: 15
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    storeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1, 
    },
    deleteButton: {
        paddingLeft: 10,
        paddingVertical: 5,
    },
    deleteButtonText: {
        fontSize: 22,
        color: '#e74c3c', 
        fontWeight: 'bold',
    },
    textHeader:{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    textDate:{
        color:"#666",
        fontSize: 12,
    },
    textTotal:{
        color:"#28a745",
        fontWeight:"bold",
    },
    positiveAmount: {
        color: '#28a745', 
    },
    negativeAmount: {
        color: '#e74c3c', 
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 10,
    },
    details:{
        flexDirection:"row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    itemName:{
        color: '#555',
        flex: 1,
    },
    itemPrice:{
        color: '#555',
    }
});

export default DailyView;

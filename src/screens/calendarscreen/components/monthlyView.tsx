import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { DailyData } from "../index"; 

interface monthlyProps{
    date: Date,
    details: DailyData[] 
}

const MonthlyView = ({ date, details }: monthlyProps) => {

    const formattedDateMonthly = date.toLocaleDateString('id-ID', {
      month: 'long',    
      year: 'numeric',  
    });

    
    const groupedByDate: { [key: string]: DailyData[] } = details.reduce((acc, current) => {
        const dateKey = current.date.toLocaleDateString('id-ID');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(current);
        return acc;
    }, {} as { [key: string]: DailyData[] });

    const totalMonthly = details.reduce((sum, currentDay) => {
        return sum + currentDay.total;
    }, 0);

    return(
        <View style={[styles.background]}>
            <View style={[styles.container]}>
                <View style={[styles.textHeader]}>
                    <Text style={[styles.textDate]}>{formattedDateMonthly}</Text>
                    <Text style={[styles.textTotal]}>Rp. {totalMonthly.toLocaleString('id-ID')}</Text>
                </View>
                
                <View style={styles.divider} />

                {Object.keys(groupedByDate).length > 0 ? (
                    Object.keys(groupedByDate).map((dateKey, index) => {
                        const dailyTotal = groupedByDate[dateKey].reduce((sum, item) => sum + item.total, 0);
                        const displayDate = new Date(groupedByDate[dateKey][0].date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                        });

                        return (
                            <TouchableOpacity key={index} style={[styles.details]}>
                                <Text style={[styles.itemName]}>{displayDate}</Text>
                                <Text style={[styles.itemPrice]}>Rp. {dailyTotal.toLocaleString('id-ID')}</Text>
                            </TouchableOpacity>
                        )
                    })
                ) : (
                    <Text style={styles.noDetailsText}>Tidak ada transaksi bulan ini.</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    background:{
        backgroundColor: 'white',
        padding: 3,
        borderRadius: 10,
        marginTop: 15,
        width: "100%",
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    container:{
        padding: 15
    },
    textHeader:{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    textDate:{
        color:"#333",
        fontSize: 18,
        fontWeight: 'bold',
    },
    textTotal:{
        color:"#28a745",
        fontWeight:"bold",
        fontSize: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 10,
    },
    details:{
        flexDirection:"row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemName:{
        color: '#555',
        fontWeight: '500',
    },
    itemPrice:{
        color: '#555',
    },
    noDetailsText: {
        color: '#888',
        fontStyle: 'italic',
    }
});

export default MonthlyView;

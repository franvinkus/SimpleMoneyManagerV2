import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CalendarHeaderProps {
    currentView: 'daily' | 'monthly';
    onViewChange: (view: 'daily' | 'monthly') => void;
    income: number;
    expenses: number;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({currentView, onViewChange, income, expenses}) => {

    const handleDaily = () =>{
        onViewChange('daily');
    }

    const handleMonthly = () =>
        onViewChange('monthly');

    const total = income - expenses;

    return (
        <View style={styles.mainBackground}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={handleDaily}
                    style={[styles.tabButton, currentView === 'daily' && styles.activeTab]}
                >
                    <Text style={[styles.tabText, currentView === 'daily' && styles.activeTabText]}>
                        Daily
                    </Text>
                </TouchableOpacity>
                
                <View style={[styles.border]}></View>

                <TouchableOpacity
                    onPress={handleMonthly}
                    style={[styles.tabButton, currentView === 'monthly' && styles.activeTab]}
                >
                    <Text style={[styles.tabText, currentView === 'monthly' && styles.activeTabText]}>
                        Monthly
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.summaries]}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabelIncome}>Income</Text>
                    <Text style={styles.summaryValue}>Rp {income.toLocaleString('id-ID')}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabelExpenses}>Expenses</Text>
                    <Text style={styles.summaryValue}>Rp {expenses.toLocaleString('id-ID')}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Total</Text>
                    <Text style={styles.summaryValue}>Rp {total.toLocaleString('id-ID')}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainBackground:{
        backgroundColor: '#2c3e50', 
        paddingVertical: 20,
        paddingTop: 40, 
    },
    tabContainer:{
        flexDirection: "row",
        justifyContent: 'space-evenly',
        marginBottom: 20,
    },
    tabButton:{
        paddingBottom: 5,
    },
    activeTab:{
        borderBottomWidth: 2,
        borderBottomColor: '#3498db',
    },
    tabText:{
        fontSize: 18,
        color: '#bdc3c7',
    },
    activeTabText:{
        color: 'white',
        fontWeight: 'bold',
    },
    border:{
        borderRightWidth: 1,
        borderColor: '#7f8c8d',
    },
    summaries:{
        flexDirection: "row",
        justifyContent: "space-around"
    },
    summaryBox: {
        alignItems: 'center',
    },
    summaryLabel: {
        color: '#bdc3c7',
        fontSize: 12,
        marginBottom: 2,
    },
    summaryLabelIncome: {
        color: '#2ecc71',
        fontSize: 12,
        marginBottom: 2,
    },
    summaryLabelExpenses: {
        color: '#e74c3c', 
        fontSize: 12,
        marginBottom: 2,
    },
    summaryValue: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    }
})

export default CalendarHeader;

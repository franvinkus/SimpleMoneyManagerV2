import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';


interface ManualTransactionModalProps{
    isInvisible: boolean;
    onClose: () => void;
    onConfirm: (amount: number, type: 'income' | 'expense', date: Date) => void;
}

const InputManualTransaction: React.FC<ManualTransactionModalProps> = ({
    isInvisible,
    onClose, 
    onConfirm
}) => {
     const [amountInput, setAmountInput] = useState('');
     const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
     const [selectedDate, setSelectedDate] = useState(new Date()); 
     const [showDatePicker, setShowDatePicker] = useState(false);

    const handleAddMoney = () => {
        const amount = parseFloat(amountInput.replace(/[^0-9]/g, '')); //hapus karakter non number
        if(!isNaN(amount) && amount > 0){
            onConfirm(amount, transactionType, selectedDate);
            setAmountInput('');
        }
        onClose();
    }

    const handleCancel = () => {
        setAmountInput('');
        onClose();
    }

    const formatAmount = (text:string) => {
        let cleanedText = text.replace(/[^0-9]/g, '');
        if (cleanedText === '') {
            return ('');
        }
        let num = parseInt(cleanedText, 10);
        return num.toLocaleString('id-ID');
    }

    const onChangeDate = (event: any, date?: Date) => {
    const currentDate = date || selectedDate;
    setShowDatePicker(false); 
        if (date) { 
        setSelectedDate(currentDate);
        }
    };
  
    const showDatepicker = () => {
    setShowDatePicker(true);
      };

    return (
        <Modal
        animationType='fade'
        transparent={true}
        visible={isInvisible}
        onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Input Transaction</Text>

                        <View style={styles.dateContainer}>
                            <Text style={styles.typeLabel}>Tanggal:</Text>
                            <TouchableOpacity onPress={showDatepicker} style={styles.dateInput}>
                            <Text style={styles.dateText}>{selectedDate.toLocaleDateString('id-ID')}</Text>
                            </TouchableOpacity>
                        </View>
                        {showDatePicker && (
                            <DateTimePicker
                            testID="dateTimePicker"
                            value={selectedDate}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                            />
                        )}

                        <View style={styles.typeContainer}>
                            <Text style={styles.typeLabel}>Jenis Transaksi:</Text>
                            <View style={styles.borderType}>
                                <Picker
                                    selectedValue={transactionType}
                                    onValueChange={(itemValue) => setTransactionType(itemValue as 'income' | 'expense')}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Pemasukan" value="income" />
                                    <Picker.Item label="Pengeluaran" value="expense" />
                                </Picker>
                            </View>
                        </View>

                        <TextInput
                        placeholder='Ketik jumlah'
                        keyboardType='numeric'
                        value={amountInput}
                        onChangeText={text => setAmountInput(formatAmount(text))}
                        autoFocus={true}  
                        style={styles.input}
                        placeholderTextColor={"black"}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={handleCancel}>
                                <Text style={{backgroundColor:'red', color:"white", padding: 10, borderRadius: 8}}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddMoney}>
                                <Text style={{backgroundColor:'green', color:"white", padding: 10, borderRadius: 8}}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>

        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        justifyContent: 'center',
        alignItems: 'center',
        flex:1,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%', 
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black'
    },
    typeContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 10,
        width: '100%',
    },
    typeLabel: {
        fontSize: 16,
        marginRight: 10,
        color: '#333',
        marginBottom: 5,
    },
    borderType:{
        width: '100%',
        height: 50, 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 10, 
        overflow: 'hidden', 
        justifyContent: 'center', 
    },
    picker: {
        width: '100%',
        color: "black",
    },
    dateContainer: { 
        flexDirection: 'column', 
        alignItems: 'flex-start', 
        marginBottom: 10, 
        width: '100%' 
    },
    dateInput: { 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 10, 
        width: '100%', 
        padding: 15, 
        justifyContent: 'center' 
    },
     dateText: { 
        fontSize: 18, 
        color: 'black' 
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        width: '100%',
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 18,
        textAlign: 'left', 
        color: 'black',
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        
    },
});

export default InputManualTransaction;
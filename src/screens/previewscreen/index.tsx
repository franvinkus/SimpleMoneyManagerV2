import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState} from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { RootStackParamList } from '../../navigation/types';
import ImagePicker from 'react-native-image-crop-picker';


const PreviewScreen = () => {
    const Navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const {photoPath: initialPhotoPath} = route.params as {photoPath: string};
    const [currentPhotoPath, setCurrentPhotoPath] = useState(initialPhotoPath);

    const handleEditPhoto = async () => {
        if(!currentPhotoPath){
            Alert.alert("Error", "Tidak ada foto untuk diedit");
            return;
        }
        try{
            const image = await ImagePicker.openCropper({
                path: 'file://' + currentPhotoPath, // Path gambar yang akan diedit
                width: 800, // Lebar output gambar setelah di-crop
                height: 1200, // Tinggi output gambar setelah di-crop
                cropping: true,
                freeStyleCropEnabled: true,
                cropperActiveWidgetColor: '#F8CEA8',
                cropperStatusBarColor: '#F8CEA8',
                cropperToolbarColor: '#F8CEA8',
                cropperToolbarTitle: 'Edit Foto',
                showCropGuidelines: true,
                mediaType: 'photo'
            });
            setCurrentPhotoPath(image.path.replace('file://', ''));
        }
        catch (error: any) {
            // Penanganan error jika user membatalkan atau terjadi kesalahan
            if (error.code === 'E_PICKER_CANCELLED') {
                console.log('User cancelled the crop operation.');
            } else {
                console.error('Error during photo editing:', error);
                Alert.alert("Edit Gagal", "Terjadi kesalahan saat mengedit foto: " + error.message);
            }
        }
    };

    const handleAcceptPhoto = () => {
        if (currentPhotoPath) {
            // Navigasi ke OcrScreen dan teruskan path foto yang sudah diedit
            Navigate.navigate("OCR", { photoPath: currentPhotoPath });
        } else {
            Alert.alert("Error", "Tidak ada foto untuk diproses.");
        }
    };

    return (
        <View style={[styles.container]}>
            <TouchableOpacity onPress={() => Navigate.navigate("Camera")} style={[styles.backButton]}>
                <Text style={[styles.backText]}>Back</Text>
            </TouchableOpacity>
            {currentPhotoPath  && (
            <Image source={{uri: 'file://' + currentPhotoPath }} style={[styles.image]}/>
            )}
            <TouchableOpacity style={styles.editButton} onPress={handleEditPhoto}>
                <Text style={{ color: 'white' }}>✂️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptPhoto}>
                <Text style={{ color: 'white' }}>✔️</Text>
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    backButton:{
        zIndex: 10,
        position: 'absolute',
        padding: 20,
        backgroundColor: "#F8CEA8",
        top: 20,
        borderRadius: 10,
        left: 20,
    },
    backText:{
        fontSize: 15
    },
    image:{
        flex:1,
        width: "100%",
        padding: 20
    },
    editButton: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        alignSelf: 'center',
        padding: 20,
        backgroundColor: '#000000aa',
        borderRadius: 40,
    },
    acceptButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        alignSelf: 'center',
        padding: 20,
        backgroundColor: '#000000aa',
        borderRadius: 40,
    },

});

export default PreviewScreen;
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, PermissionsAndroid, Platform, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { RootStackParamList } from '../../navigation/types';

const CameraScreen = () => {
    const Navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const camera = useRef<Camera>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const devices = useCameraDevices();
    const device = devices.find(d => d.position === 'back');
    const [photoPath, setPhotoPath] = useState<string | null>(null);


    useEffect(() => {
        const getPermission = async () => {
            const permission = await Camera.requestCameraPermission();
            console.log(permission);
            if (permission === 'granted') {
                setHasPermission(true);
            } else {
                setHasPermission(false);
            }
        };

        getPermission();
    }, []);

    const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
        try {
        const grantedMedia = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
            title: 'Izin Galeri',
            message: 'Aplikasi ini membutuhkan akses ke galeri Anda untuk memilih foto.',
            buttonNeutral: 'Tanya Nanti',
            buttonNegative: 'Batal',
            buttonPositive: 'OK',
            },
        );

        if (grantedMedia === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Izin READ_MEDIA_IMAGES diberikan');
            return true;
        } else {
            const grantedStorage = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
                title: 'Izin Penyimpanan',
                message: 'Aplikasi ini membutuhkan akses ke penyimpanan Anda untuk memilih foto.',
                buttonNeutral: 'Tanya Nanti',
                buttonNegative: 'Batal',
                buttonPositive: 'OK',
            },
            );
            if (grantedStorage === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Izin READ_EXTERNAL_STORAGE diberikan');
                return true;
            } else {
                console.log('Izin galeri/penyimpanan ditolak');
                return false;
            }
        }
        } catch (err) {
        console.warn(err);
        return false;
        }
    }
    return true; 
    };

    const takePhoto = async () => {
        if (camera.current == null) return;
        const photo = await camera.current.takePhoto({});
        console.log('Photo path:', photo.path);
        setPhotoPath(photo.path);
    };

    const handleSelectFromGallery = async () => {
        const hasPermission = await requestGalleryPermission();
        if (!hasPermission) {
            Alert.alert('Izin Diperlukan', 'Aplikasi memerlukan akses ke galeri foto Anda untuk melanjutkan.');
            return;
        }
        launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
        }, (response) => {
            if (response.didCancel) {
                console.log('Pengguna membatalkan pemilihan gambar');
            } else if (response.errorCode) {
                console.error('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0];
                if (selectedImage.uri) {
                    Navigate.navigate("Preview", { photoPath: selectedImage.uri });
                }
            }
        });
    };


    if (device == null || !hasPermission) return <Text> Loading camera...</Text>;

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.backButton} onPress={() => Navigate.navigate('Home')}>
                <Text style={[styles.backText]}>Back</Text>
            </TouchableOpacity>

            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
            />

            
            <View style={styles.buttonContainer}>
                
                <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                    <Text style={{ fontSize: 30 }}>📸</Text>
                </TouchableOpacity>

               
                <TouchableOpacity style={styles.galleryButton} onPress={handleSelectFromGallery}>
                    <Text style={{ fontSize: 30 }}>🖼️</Text>
                </TouchableOpacity>
            </View>

           
            {photoPath && (
                <View style={styles.previewContainer}>
                    <Text style={{ color: 'white' }}>Preview:</Text>
                    <TouchableOpacity onPress={() => Navigate.navigate("Preview", { photoPath })}>
                        <Image source={{ uri: 'file://' + photoPath }} style={styles.previewImage} />
                    </TouchableOpacity>
                </View>
            )} 
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    captureButton: {
        padding: 20,
        backgroundColor: '#000000aa',
        borderRadius: 50, 
    },
    galleryButton: { 
        padding: 15,
        backgroundColor: '#000000aa',
        borderRadius: 40,
    },
    backButton: {
        padding: 20,
        backgroundColor: '#F8CEA8',
        position: 'absolute',
        zIndex: 10,
        top: 40, 
        borderRadius: 15,
        left: 20,
    },
    backText: {
        fontSize: 15,
    },
    previewContainer: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    previewImage: {
        width: 100,
        height: 150,
        borderRadius: 8,
        marginTop: 5,
    },
});

export default CameraScreen;
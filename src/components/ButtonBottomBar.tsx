import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp} from '@react-navigation/native-stack';

type props = {
    screen: keyof RootStackParamList; //sesuain di Types.tsx
    params?: any;
    icon: ImageSourcePropType;
}

const ButtonBottomBar = ({screen, params, icon}: props) => {
    const Navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return(
        <TouchableOpacity onPress={() => Navigate.navigate(screen as any, params)} style={[style.button]}>
            <Image source={icon}  style={style.icon}/>
        </TouchableOpacity>
    )
};

export default ButtonBottomBar;

const style = StyleSheet.create({
    button: {
        padding: 10, // memberi ruang di sekeliling icon
        alignItems: 'center',
        justifyContent: 'center',
     },
    icon:{
        height: 80,
        width: 80,
        borderRadius: 15
    }
})

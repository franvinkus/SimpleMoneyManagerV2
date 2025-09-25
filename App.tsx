import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator'; // Import your main App Navigator
import { 
    ActivityIndicator, 
    Alert, 
    Image, 
    StyleSheet, 
    Text,       
    TouchableOpacity, 
    View        
} from 'react-native'; 
import { ModalProvider } from './src/context/modalContext';


const App = () => {

  return (
    // NavigationContainer manages your app's navigation tree.
    // All navigators must be wrapped inside a NavigationContainer.
    <ModalProvider>
      <NavigationContainer>
        {/* AppNavigator defines the stack of screens for your application. */}
        <AppNavigator />
      </NavigationContainer>
    </ModalProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});


export default App;

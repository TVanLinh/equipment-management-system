import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import QRScanScreen from './screens/QRScanScreen';
import EquipmentDetailScreen from './screens/EquipmentDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="QRScan">
        <Stack.Screen 
          name="QRScan" 
          component={QRScanScreen}
          options={{
            title: 'Quét mã QR',
            headerStyle: {
              backgroundColor: '#f87171',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="EquipmentDetail" 
          component={EquipmentDetailScreen}
          options={{
            title: 'Chi tiết thiết bị',
            headerStyle: {
              backgroundColor: '#f87171',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

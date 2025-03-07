import { StyleSheet, Text, View } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  QRScan: undefined;
  EquipmentDetail: { equipmentId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'QRScan'>;

export default function QRScanScreen({ navigation }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    navigation.navigate('EquipmentDetail', { equipmentId: data });
  };

  if (hasPermission === null) {
    return <Text>Đang yêu cầu quyền truy cập camera...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Không có quyền truy cập camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
            <Text style={styles.text}>Quét mã QR của thiết bị</Text>
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5
  },
  focusedContainer: {
    flex: 6,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 4
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20
  }
});

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  QRScan: undefined;
  EquipmentDetail: { equipmentId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentDetail'>;

type Equipment = {
  id: number;
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  countryOfOrigin: string;
  unitPrice: string;
  vat: string;
  fundingSource: string;
  supplier: string;
  status: string;
  purchaseDate: string;
  warrantyExpiry: string;
  departmentId: number | null;
};

export default function EquipmentDetailScreen({ route }: Props) {
  const { equipmentId } = route.params;
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipmentDetails();
  }, [equipmentId]);

  const fetchEquipmentDetails = async () => {
    try {
      // Đường dẫn API sẽ được cập nhật trong Repl mới
      const API_URL = 'http://your-api-endpoint';
      const response = await fetch(`${API_URL}/api/equipment/${equipmentId}`);
      const data = await response.json();

      if (response.ok) {
        setEquipment(data);
      } else {
        setError(data.error || 'Không thể tải thông tin thiết bị');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f87171" />
        <Text style={styles.loadingText}>Đang tải thông tin thiết bị...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!equipment) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy thiết bị</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Mã thiết bị:</Text>
          <Text style={styles.value}>{equipment.equipmentId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tên thiết bị:</Text>
          <Text style={styles.value}>{equipment.equipmentName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Loại thiết bị:</Text>
          <Text style={styles.value}>{equipment.equipmentType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Model:</Text>
          <Text style={styles.value}>{equipment.model}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Số serial:</Text>
          <Text style={styles.value}>{equipment.serialNumber}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin sản xuất</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Hãng sản xuất:</Text>
          <Text style={styles.value}>{equipment.manufacturer}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nước sản xuất:</Text>
          <Text style={styles.value}>{equipment.countryOfOrigin}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nhà cung cấp:</Text>
          <Text style={styles.value}>{equipment.supplier}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin tài chính</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Đơn giá:</Text>
          <Text style={styles.value}>
            {new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND' 
            }).format(Number(equipment.unitPrice))}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>VAT:</Text>
          <Text style={styles.value}>{equipment.vat}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Nguồn kinh phí:</Text>
          <Text style={styles.value}>{equipment.fundingSource}</Text>
        </View>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Trạng thái & Thời hạn</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái:</Text>
          <Text style={styles.value}>{equipment.status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ngày mua:</Text>
          <Text style={styles.value}>
            {new Date(equipment.purchaseDate).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Hết hạn bảo hành:</Text>
          <Text style={styles.value}>
            {new Date(equipment.warrantyExpiry).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  lastSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: '#666',
  },
  value: {
    flex: 2,
    fontSize: 15,
    color: '#111',
  },
});
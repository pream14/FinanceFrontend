import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentEntries = () => {
  const [payments, setPayments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);

  const fetchWorkers = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Access token not found');
        return;
      }

      const response = await fetch('http://192.168.151.233:5000/get_workers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workers');
      }

      const data = await response.json();
      console.log('Fetched workers:', data);
      setWorkers(data);
    } catch (err) {
      console.error('Error fetching workers:', err.message);
      setError(err.message || 'Error fetching workers');
    }
  };

  const fetchPaymentsByWorker = async (workerId, date) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Access token not found');
        return;
      }

      const url = workerId
        ? `http://192.168.151.233:5000/get_entries_by_worker?worker_id=${workerId}&payment_date=${date}`
        : `http://192.168.151.233:5000/get_entries_by_worker?payment_date=${date}`; // Fetch all records for the date if no worker is selected

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      console.log('Fetched payments:', data);
      setPayments(data.payments || []);
      setTotalAmountPaid(data.total_amount_paid || 0);
      setError('');
    } catch (err) {
      console.error('Error fetching payments:', err.message);
      setError(err.message || 'Error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    fetchPaymentsByWorker(selectedWorker, paymentDate);
  }, [selectedWorker, paymentDate]);

  const renderHeader = () => (
    <View style={[styles.row, styles.header]}>
      <Text style={[styles.cell, styles.headerCell]}>Name</Text>
      <Text style={[styles.cell, styles.headerCell]}>Number</Text>
      <Text style={[styles.cell, styles.headerCell]}>Amount Paid</Text>
      <Text style={[styles.cell, styles.headerCell]}>Status</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View>
      <View style={styles.row}>
        <Text style={styles.cell}>{item.customer_name}</Text>
        <Text style={styles.cell}>{item.customer_id}</Text>
        <Text style={styles.cell}>{item.amount_paid}</Text>
        <Text style={styles.cell}>{item.payment_status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Worker Payment Entries</Text>
      <Picker
        selectedValue={selectedWorker}
        onValueChange={(itemValue) => setSelectedWorker(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="ALL" value="" />
        {workers.map((worker) => (
          <Picker.Item
            key={worker.user_id}
            label={worker.username}
            value={worker.user_id}
          />
        ))}
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Enter payment date (YYYY-MM-DD)"
        value={paymentDate}
        onChangeText={setPaymentDate}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          {renderHeader()}
          <FlatList
            data={payments}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total: ${totalAmountPaid}</Text>
          </View>
        </View>
      )}
      <Button
        title="Refresh Entries"
        onPress={() => fetchPaymentsByWorker(selectedWorker, paymentDate)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
  picker: {
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: '#f9f9f9',
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  header: {
    backgroundColor: '#f4f4f4',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: 'bold',
  },
  totalRow: {
    paddingTop: 20,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PaymentEntries;

import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentEntries = () => {
  const [payments, setPayments] = useState([]);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPaymentsbyworker = async (date) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Worker ID token not found');
        return;
      }

      const response = await fetch(
        `http://192.168.151.233:5000/get_entries_by_worker?payment_date=${date}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data.payments || []);
      setError('');
    } catch (err) {
      console.error('Error fetching payments:', err.message);
      setError(err.message || 'Error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setPaymentDate(date);
    fetchPaymentsbyworker(date);
  };

  useEffect(() => {
    fetchPaymentsbyworker(paymentDate);
  }, []);

  const renderHeader = () => (
    <View style={[styles.row, styles.header]}>
      <Text style={[styles.cell, styles.headerCell]}>Name</Text>
      <Text style={[styles.cell, styles.headerCell]}>Number</Text>
      <Text style={[styles.cell, styles.headerCell]}>Amount paid</Text>
      <Text style={[styles.cell, styles.headerCell]}>Status</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.customer_name}</Text>
      <Text style={styles.cell}>{item.customer_id}</Text>
      <Text style={styles.cell}>{item.amount_paid}</Text>
      <Text style={styles.cell}>{item.payment_status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Worker Payment Entries</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter payment date (YYYY-MM-DD)"
        value={paymentDate}P
        onChangeText={handleDateChange}
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
        </View>
      )}
      <Button title="Refresh Entries" onPress={() => fetchPaymentsbyworker(paymentDate)} />
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
});

export default PaymentEntries;

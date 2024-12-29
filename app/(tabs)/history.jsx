import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentService = {
  getCustomerPaymentHistory: async (customerId, customerName, token) => {
    try {
      let url = 'http://192.168.151.233:5000/get_customer_payment_history?';
      if (customerId) {
        url += `customer_id=${customerId}&`;
      }
      if (customerName) {
        url += `customer_name=${customerName}&`;
      }
      url = url.slice(0, -1);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

const PaymentHistory = () => {
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchPaymentHistory = async () => {
    if (!customerId && !customerName) {
      setError("Either customer_id or customer_name must be provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Worker ID token not found');
        return;
      }

      const data = await PaymentService.getCustomerPaymentHistory(customerId, customerName, token);
      setPayments(data.payments); // Store the payment data
    } catch (error) {
      setError('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment History</Text>

      {/* Customer ID or Name input */}
      <TextInput
        placeholder="Enter Customer ID"
        value={customerId}
        onChangeText={setCustomerId}
        style={styles.input}
      />
      <TextInput
        placeholder="Enter Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
        style={styles.input}
      />

      {/* Error message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {/* Fetch Button */}
      <Button title="Fetch Payment History" onPress={handleFetchPaymentHistory} />

      {/* Payment List */}
      {!loading && payments.length > 0 && (
        
        <View style={styles.table}>
        <Text style={styles.tablehe}>Customer: {payments[0].customer_name}</Text>
        <Text style={styles.tablehe}>Number: {payments[0].customer_id}</Text>
        <Text style={styles.tablehe}>Amount: {payments[0].loan_amount}</Text>
        <Text style={styles.tableh}>Balance: {payments[0].balance}</Text>
          {/* Table Heading */}
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Date</Text>
            <Text style={styles.tableHeader}>Amount Paid</Text>
          </View>

          {/* Table Data */}
          <FlatList
            data={payments}
            keyExtractor={(item, index) => `${item.customer_id}_${index}`}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={styles.tableData}>{item.payment_date}</Text>
                <Text style={styles.tableData}>${item.amount_paid}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* If no payments found */}
      {!loading && payments.length === 0 && <Text>No payment history found.</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  table: {
    marginTop: 20,
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableHeader: {
    fontWeight: 'bold',
    width: '50%',
    textAlign: 'center',
  },
  tableh: {
    fontWeight: 'bold',
    width: '50%',
    marginBottom:20
  },
  tablehe: {
    fontWeight: 'bold',
    width: '50%',
  },
  tableData: {
    width: '50%',
    textAlign: 'center',
  },
});

export default PaymentHistory;

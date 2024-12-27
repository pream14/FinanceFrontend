import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FinanceEntryPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [today, setToday] = useState('');
  const [workerId, setWorkerId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://192.168.151.233:5000/get_customers');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const customerData = await response.json();
        setCustomers(customerData);
        setFilteredCustomers(customerData); // Initialize filtered list
        const uniqueLocations = [...new Set(customerData.map((customer) => customer.location))];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    };

    const fetchToday = () => {
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0];
      setToday(formattedDate);
    };

    const fetchWorkerId = async () => {
      try {
        const storedWorkerId = await AsyncStorage.getItem('access_token');
        if (storedWorkerId) {
          setWorkerId(storedWorkerId);
        } else {
          console.log('Worker ID not found');
        }
      } catch (error) {
        console.error('Error fetching worker ID:', error);
      }
    };

    fetchCustomers();
    fetchToday();
    fetchWorkerId();
  }, []);

  useEffect(() => {
    const filterCustomers = () => {
      let updatedList = customers;

      // Apply search filter
      if (searchText.trim() !== '') {
        updatedList = updatedList.filter((customer) =>
          customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
          customer.contact_number.includes(searchText)
        );
      }

      // Apply location filter
      if (selectedLocation.trim() !== '') {
        updatedList = updatedList.filter((customer) => customer.location === selectedLocation);
      }

      setFilteredCustomers(updatedList);
    };

    filterCustomers();
  }, [searchText, selectedLocation, customers]);
  useEffect(() => {
    const fetchPaymentsForAllCustomers = async () => {
      try {
        const updatedAmounts = {};
        for (const customer of customers) {
          const response = await fetch(
            `http://192.168.151.233:5000/get_payment_by_date?customer_id=${customer.contact_number}&payment_date=${today}`,
            {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const paymentData = await response.json();
          paymentData.payments.forEach(payment => {
            updatedAmounts[`${payment.customer_id}-${today}`] = Math.round(payment.amount_paid); // Ensure it's rounded to an integer
          });
        }
        console.log('Updated amounts:', updatedAmounts); // Debugging to check the values
        setAmounts(updatedAmounts);
      } catch (error) {
        console.error("Error fetching payments for all customers:", error);
      }
    };

    if (customers.length > 0) {
      fetchPaymentsForAllCustomers();
    }
  }, [customers, today]);


  const handleAmountChange = (customerId, value) => {
    const amount = value ? parseInt(value, 10) : 0;
    setAmounts((prev) => ({
      ...prev,
      [`${customerId}-${today}`]: amount,
    }));
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'Worker ID token not found');
        return;
      }

      const updates = Object.entries(amounts).map(([key, value]) => {
        const [customerId] = key.split('-');
        return {
          worker_id: token,
          customer_id: customerId,
          amount_paid: value,
          payment_status: value > 0 ? 'Paid' : 'Unpaid',
        };
      });

      const response = await fetch('http://192.168.151.233:5000/update_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message || 'Payments updated successfully');
      } else {
        Alert.alert('Error', data.error || 'An error occurred');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };

  const calculateTotal = () => {
    return Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
  };

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.filterRow}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name or phone..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <Picker
          selectedValue={selectedLocation}
          style={styles.picker}
          onValueChange={(value) => setSelectedLocation(value)}
        >
          <Picker.Item label="All Locations" value="" />
          {locations.map((location, index) => (
            <Picker.Item key={index} label={location} value={location} />
          ))}
        </Picker>
      </View>

      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.fixedCell, styles.headerCell]}>Customer</Text>
        <Text style={[styles.fixedCell, styles.headerCell]}>Phone</Text>
        <Text style={[styles.fixedCell, styles.headerCell]}>{today}</Text>
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item, index) => `${item.customer_id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.fixedCell}>{item.name}</Text>
            <Text style={styles.fixedCell}>{item.contact_number}</Text>
            <TextInput
              style={[styles.cellInput, { textAlign: 'center' }]}
              keyboardType="numeric"
              placeholder="0"
              value={String(amounts[`${item.contact_number}-${today}`] || '')}
              onChangeText={(value) => handleAmountChange(item.contact_number, value)}
            />
          </View>
        )}
      />

      {/* Total Display */}
      <View style={styles.totalRow}>
        <Text style={styles.totalText}>Total: {calculateTotal()}</Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Lighter background for a cleaner feel
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  searchBar: { flex: 2, height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10 },
  picker: {
    flex: 1,
    height: Platform.OS === 'android' ? 50 : 10, // Adjust height for Android
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    color: '#000', // Text color
    paddingHorizontal: Platform.OS === 'android' ? 8 : 0, // Padding for Android
    justifyContent: 'center',
  },
  
    headerRow: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 20,

    borderBottomWidth: 2,
    borderBottomColor: '#ddd', // To separate the header from the body
    paddingBottom: 5,
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15, // Increased space for better readability
    alignItems: 'center', // Center align text in each row
  },
  fixedCell: {
    flex: 1,
    paddingVertical: 12, // Adjusted for better padding
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600', // Slightly lighter weight for a cleaner look
    borderWidth: 1,
    borderColor: '#dcdcdc',
    backgroundColor: '#f7f7f7', // Slightly lighter background color for cells
    borderRadius: 8,
  },
  cellInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    backgroundColor: '#fff', // White background for input fields
    borderRadius: 8,
  },
  headerCell: {
    fontSize: 16,
    fontWeight: '700', // Bold font for headers
    backgroundColor: '#2980b9', // Blue background for header cells
    color: '#fff',
    borderRadius: 8, // Rounded corners for header cells
  },
  button: {
    marginTop: 20,
    height: 50,
    backgroundColor: '#2980b9', // Keeping the button blue for consistency
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#2980b9', // Adding shadow for a subtle raised effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    elevation: 5, // Elevation for Android devices
  },
  buttonText: {
    color: '#fff',
    fontSize: 18, // Slightly larger font for button text
    fontWeight: 'bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2980b9',
  },
});

export default FinanceEntryPage;
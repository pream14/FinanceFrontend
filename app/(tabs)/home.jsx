import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreen = ({ navigation }) => {

  // Sample navigation functions for the buttons (to be connected to actual screens later)
  const navigateToCustomerDetails = () => {
    navigation.navigate('CustomerDetails');
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome to Finance Manager</Text>
      </View>

      <View style={styles.overviewContainer}>
        <Text style={styles.overviewText}>Overview</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Payments</Text>
          <Text style={styles.cardAmount}>$1200</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Payments</Text>
          <Text style={styles.cardAmount}>$5000</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={navigateToCustomerDetails}
        >
          <Text style={styles.buttonText}>Customer Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={navigateToSettings}
        >
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  overviewContainer: {
    marginBottom: 40,
  },
  overviewText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

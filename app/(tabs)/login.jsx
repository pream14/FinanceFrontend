import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://192.168.151.233:5000/login';

  const handleLogin = async () => {
    setErrorMessage('');

    if (!userId.trim() || !password.trim()) {
      setErrorMessage('User ID and password are required');
      return;
    }

    setLoading(true);
    const loginData = { user_id: userId, password };

    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data)
        await AsyncStorage.setItem('access_token', data.access_token);
        await AsyncStorage.setItem('role',data. role);
        await AsyncStorage.setItem('username', data.username);
        navigation.navigate('Entry');
      } else {
        setErrorMessage(data.error || 'Invalid user ID or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default Login;

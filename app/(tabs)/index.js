import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';

// Import your screens
import HomeScreen from './home';
import LoginScreen from './login';
import Entry from './entry';

// Create a Stack Navigator
const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if token is available (You can use AsyncStorage, SecureStore, or Context for real-world apps)
  useEffect(() => {
    const checkAuthentication = async () => {
      // Simulate token check (replace with actual logic)
      const token = await getToken(); // You'd fetch the token from AsyncStorage or any state management
      setIsAuthenticated(!!token);
    };
    
    checkAuthentication();
  }, []);

  // Example function to simulate getting token (replace with actual logic)
  const getToken = async () => {
    // Return a dummy token or null based on your actual implementation
    return null; // or return 'dummy-token' to simulate authentication
  };

  return (
    // Do not wrap NavigationContainer here if it's already in the root or provided by a higher-level component
    <Stack.Navigator initialRouteName={isAuthenticated ? 'Home' : 'Login'}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Entry" component={Entry} />
    </Stack.Navigator>
  );
}

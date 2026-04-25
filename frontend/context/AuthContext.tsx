import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { Platform } from 'react-native';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // অ্যাপ খোলার সময় চেক করবে টোকেন আছে কিনা
    const checkUser = async () => {
      try {
        let token, userData;

        if (Platform.OS === 'web') {
          token = localStorage.getItem('userToken');
          userData = localStorage.getItem('userData');
        } else {
          token = await SecureStore.getItemAsync('userToken');
          userData = await SecureStore.getItemAsync('userData');
        }

        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.log("Error loading user", error);
      }
      setIsLoading(false);
    };
    checkUser();
  }, []);

  // --- Login Function ---
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, ...userData } = res.data;
      
      if (Platform.OS === 'web') {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      }
      
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // --- New Registration + Auto Login Function ---
  const register = async (payload: any) => {
    try {
      // ১. ব্যাকএন্ডে রেজিস্ট্রেশন রিকোয়েস্ট পাঠানো
      const res = await api.post('/auth/register', payload);
      const { token, ...userData } = res.data;
      
      // ২. টোকেন ও ইউজার ডেটা লোকাল স্টোরেজে সেভ করা
      if (Platform.OS === 'web') {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      }
      
      // ৩. স্টেট আপডেট করা (এটি করলে ইউজার সরাসরি ড্যাশবোর্ডে চলে যাবে)
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  // --- New Helper Function for OTP Verification ---
  const setAndSaveUser = async (data: any) => {
    const { token, ...userData } = data;
    if (Platform.OS === 'web') {
      localStorage.setItem('userToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
    }
    setUser(userData);
  };

  // --- Logout Function ---
  const logout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    } else {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
    }
    setUser(null);
  };

  return (
    // Provider-এ setAndSaveUser অ্যাড করা হলো
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, setAndSaveUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
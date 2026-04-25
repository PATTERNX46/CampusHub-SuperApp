import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Animated } from 'react-native';
import { useRef, useEffect } from 'react';

// 🌟 Custom Animated 3D Icon Component
const TabIcon = ({ name, focused, bgColor }: { name: any, focused: boolean, bgColor: string }) => {
  const scaleValue = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  useEffect(() => {
    // 💥 Bounce Animation
    Animated.spring(scaleValue, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
      friction: 4,
      tension: 50
    }).start();
  }, [focused]);

  return (
    <Animated.View style={[
      styles.iconContainer,
      {
        backgroundColor: focused ? bgColor : 'transparent',
        transform: [{ scale: scaleValue }],
        // 3D Shadow for focused state
        elevation: focused ? 10 : 0,
        shadowColor: bgColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: focused ? 0.5 : 0,
        shadowRadius: 8,
      }
    ]}>
      <Ionicons name={name} size={22} color={focused ? '#ffffff' : '#94A3B8'} />
    </Animated.View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Label হাইড করে দিলাম ক্লিন লুকের জন্য
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 60,
          right: 60,
          elevation: 12,
          backgroundColor: '#ffffff',
          borderRadius: 35,
          height: 70,
          // 3D Glassmorphism Shadow for the Bar
          shadowColor: '#4361EE',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          borderWidth: 1,
          borderColor: '#F1F5F9',
        },
      }}
    >
      {/* 🏠 Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} focused={focused} bgColor="#4361EE" />
          ),
        }}
      />

      {/* 👤 Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "person" : "person-outline"} focused={focused} bgColor="#F72585" />
          ),
        }}
      />

      {/* 🚫 Hidden Tabs (এগুলো মেনুতে দেখাবে না, কিন্তু রাউটিং কাজ করবে) */}
      <Tabs.Screen name="marketplace" options={{ href: null }} />
      <Tabs.Screen name="add-product" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25, // Centering inside the tab bar
  }
});
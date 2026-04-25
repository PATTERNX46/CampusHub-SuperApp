import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

function InitialLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    // 👇 নতুন লজিক: এই পেজগুলো লগইন ছাড়াই খোলা যাবে
    const publicPages = ['role-selection', 'register-student', 'register-normal'];
    const isPublicPage = publicPages.includes(segments[0] as string);

    if (!user && !inAuthGroup && !isPublicPage) {
      // ইউজার লগইন নেই এবং কোনো পাবলিক পেজেও নেই, তাই লগইনে পাঠাও
      router.replace('/(auth)/login');
    } else if (user && (inAuthGroup || isPublicPage)) {
      // ইউজার লগইন আছে, তাই তাকে ড্যাশবোর্ডে পাঠাও
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4361EE" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
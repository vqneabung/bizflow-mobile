/**
 * (app)/_layout.tsx — Tab layout cho authenticated screens.
 *
 * Bottom tabs: Dashboard, Profile.
 */
import { Tabs } from 'expo-router'
import { Text } from 'react-native'

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#7c3aed' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tabs>
  )
}

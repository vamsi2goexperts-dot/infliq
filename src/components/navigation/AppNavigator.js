import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { navigationRef } from '../../services/navigationService';

// Screens
import LoginScreen from '../../screens/auth/LoginFixed';
import RegisterScreen from '../../screens/auth/RegisterScreen';
import MapDiscoveryScreen from '../../screens/map/MapDiscoveryScreen';
import FeedScreen from '../../screens/feed/FeedScreen';
import ReelsScreen from '../../screens/reels/ReelsScreen';
import MessagesScreen from '../../screens/messages/MessagesScreen';
import ChatDetailScreen from '../../screens/messages/ChatDetailScreen';
import EditProfileScreen from '../../screens/profile/EditProfileScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import CreatePostScreen from '../../screens/feed/CreatePostScreen';
import PostDetail from '../../screens/feed/PostDetailScreen';
import SearchScreen from '../../screens/search/SearchScreenV2';
import CallScreen from '../../screens/messages/CallScreen';
import SettingsScreen from '../../screens/profile/SettingsScreen';
import SettingsDetailScreen from '../../screens/profile/SettingsDetailScreen';
import CreateSheet from '../CreateSheet';

import { useAuth } from '../../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ name, focused, size = 26 }) => {
    // Some icons (like logo-rss) don't have -outline variants
    const iconName = focused || name.startsWith('logo-') ? name : `${name}-outline`;

    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: focused ? '#E8F1FF' : 'transparent',
            width: 50,
            height: 50,
            borderRadius: 25,
        }}>
            <Ionicons
                name={iconName}
                size={size}
                color={focused ? '#0066FF' : COLORS.black}
            />
        </View>
    );
};



function BottomTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: COLORS.darkSlate,
                    borderTopWidth: 0,
                    height: 60,
                    paddingBottom: 8
                },
                tabBarActiveTintColor: COLORS.white,
                tabBarInactiveTintColor: COLORS.mediumGray,
                headerShown: false
            }}
        >
            <Tab.Screen
                name="Feed"
                component={FeedScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="newspaper-outline" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Map"
                component={MapDiscoveryScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="globe-outline" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Create"
                component={FeedScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle-outline" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Reels"
                component={ReelsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="videocam-outline" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { user, loading } = useAuth();
    const [createVisible, setCreateVisible] = React.useState(false);

    if (loading) {
        return null; // Or loading screen
    }

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main">
                            {({ navigation }) => (
                                <View style={{ flex: 1 }}>
                                    <Tab.Navigator
                                        initialRouteName="Feed"
                                        screenOptions={{
                                            tabBarStyle: {
                                                backgroundColor: COLORS.white,
                                                borderTopWidth: 0,
                                                height: 80,
                                                paddingBottom: 10,
                                                paddingTop: 10,
                                                elevation: 10,
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: -2 },
                                                shadowOpacity: 0.1,
                                                shadowRadius: 4,
                                                borderTopLeftRadius: 30,
                                                borderTopRightRadius: 30,
                                                position: 'absolute', // Ensures rounded corners are visible
                                            },
                                            tabBarShowLabel: false,
                                            tabBarActiveTintColor: COLORS.black,
                                            tabBarInactiveTintColor: COLORS.black,
                                            headerShown: false
                                        }}
                                    >
                                        <Tab.Screen
                                            name="Map"
                                            component={MapDiscoveryScreen}
                                            options={{
                                                tabBarIcon: ({ focused }) => (
                                                    <TabIcon name="globe" focused={focused} />
                                                )
                                            }}
                                        />
                                        <Tab.Screen
                                            name="Feed"
                                            component={FeedScreen}
                                            options={{
                                                tabBarIcon: ({ focused }) => (
                                                    <TabIcon name="logo-rss" focused={focused} size={24} />
                                                )
                                            }}
                                        />
                                        <Tab.Screen
                                            name="Create"
                                            component={View} // Placeholder
                                            listeners={{
                                                tabPress: (e) => {
                                                    e.preventDefault();
                                                    setCreateVisible(true);
                                                },
                                            }}
                                            options={{
                                                tabBarIcon: ({ focused }) => (
                                                    <TabIcon name="add" focused={focused} size={32} />
                                                )
                                            }}
                                        />
                                        <Tab.Screen
                                            name="Reels"
                                            component={ReelsScreen}
                                            options={{
                                                tabBarIcon: ({ focused }) => (
                                                    <TabIcon name="play" focused={focused} size={28} />
                                                )
                                            }}
                                        />
                                        <Tab.Screen
                                            name="Profile"
                                            component={ProfileScreen}
                                            options={{
                                                tabBarIcon: ({ focused }) => (
                                                    <TabIcon name="person-circle" focused={focused} size={28} />
                                                )
                                            }}
                                        />
                                    </Tab.Navigator>

                                    <CreateSheet
                                        visible={createVisible}
                                        onClose={() => setCreateVisible(false)}
                                        navigation={navigation}
                                    />
                                </View>
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
                        <Stack.Screen name="Search" component={SearchScreen} />
                        <Stack.Screen name="Messages" component={MessagesScreen} />
                        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="UserProfile" component={ProfileScreen} />
                        <Stack.Screen name="PostDetail" component={PostDetail} />
                        <Stack.Screen name="CallScreen" component={CallScreen} />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                        <Stack.Screen name="SettingsDetail" component={SettingsDetailScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}


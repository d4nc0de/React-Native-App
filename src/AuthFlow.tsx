import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { IconButton } from "react-native-paper";

import { useNavigation } from "@react-navigation/native";
import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import CourseCategoriesScreen from "./features/courses/presentation/screens/CourseCategoriesScreen";
import CreateClassScreen from "./features/courses/presentation/screens/CreateClassScreen";
import JoinClassScreen from "./features/courses/presentation/screens/JoinClassScreen";
import StudentClassDetailScreen from "./features/courses/presentation/screens/StudentClassDetailScreen";
import TeacherClassDetailScreen from "./features/courses/presentation/screens/TeacherClassDetailScreen";
import AddProductScreen from "./features/products/presentation/screens/AddProductScreen";
import HomeScreen from "./features/products/presentation/screens/HomeScreen";
import UpdateProductScreen from "./features/products/presentation/screens/UpdateProductScreen";
import SettingScreen from "./features/settings/SettingScreen";



const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function AuthFlow() {
  const { isLoggedIn, logout } = useAuth();
  const navigation = useNavigation<any>();
  
  const handleLogout = async () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
    await logout();
  };

  function ContentTabs() {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,      // ocultamos la cabecera fea
          tabBarStyle: { display: "none" }, // ocultamos completamente la tab bar, para que no se vea el Home
          headerTitle: "Auth demo with React Navigation",
          headerRight: () => (
            <IconButton icon="logout" onPress={() => handleLogout()} />
          ),
          headerTitleAlign: "left",
          headerStyle: {
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
          },
        }}

      >
        {/* <Tab.Screen
          name="Home"
          component={ProductListScreen}
          options={{

            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="house" size={24} color={color} iconStyle="solid" />
            )
          }}
        /> */}
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: "Home" }}
        />
        <Tab.Screen
          name="Profile"
          component={SettingScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="user" size={24} color={color} />
            )
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="App" component={ContentTabs} />
          <Stack.Screen
            name="AddProductScreen"
            component={AddProductScreen}
            options={{
              title: "Add Product",
              headerShown: true,
              presentation: 'modal' // Optional: makes it slide up from bottom
            }}
          />
          <Stack.Screen
            name="UpdateProductScreen"
            component={UpdateProductScreen}
            options={{
              title: "Update Product",
              headerShown: true,
              presentation: 'modal' // Optional: makes it slide up from bottom
            }}
          />

          <Stack.Screen
            name="CreateClass"
            component={CreateClassScreen}
            options={{
              title: "Create class",
              headerShown: true,
            }}
          />

          <Stack.Screen
            name="JoinClass"
            component={JoinClassScreen}
            options={{
              title: "Join class",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="TeacherClassDetail"
            component={TeacherClassDetailScreen}
            options={{ title: "Class Detail", headerShown: true }}
          />
           <Stack.Screen
            name="StudentClassDetail"
            component={StudentClassDetailScreen}
            options={{ headerShown: true, title: "Class Detail" }}
          />
          <Stack.Screen
            name="CourseCategories"
            component={CourseCategoriesScreen}
            options={{
              headerShown: true,
              title: "Categories",
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
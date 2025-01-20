import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";

import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import LibraryScreen from "./src/screens/LibraryScreen";
import AlbumScreen from "./src/screens/AlbumScreen";
import { MusicPlayerProvider } from "./src/context/MusicPlayerContext";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Accueil") iconName = "home";
          else if (route.name === "Rechercher") iconName = "search";
          else if (route.name === "Bibliothèque") iconName = "library-music";

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Rechercher" component={SearchScreen} />
      <Tab.Screen name="Bibliothèque" component={LibraryScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <MusicPlayerProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Tabs"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AlbumScreen"
            component={AlbumScreen}
            options={{
              title: "Détails de l'Album",
              headerStyle: { backgroundColor: "#1DB954" },
              headerTintColor: "#fff",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </MusicPlayerProvider>
  );
}

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack"; // Ajouter un Stack Navigator
import { MaterialIcons } from "@expo/vector-icons";

import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import LibraryScreen from "./src/screens/LibraryScreen";
import AlbumScreen from "./src/screens/AlbumScreen"; // Importer AlbumScreen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // Créer un Stack Navigator

// Définir le BottomTabNavigator
function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Accueil") {
            iconName = focused ? "home" : "home";
          } else if (route.name === "Rechercher") {
            iconName = focused ? "search" : "search";
          } else if (route.name === "Bibliothèque") {
            iconName = focused ? "library-music" : "library-music";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Cacher l'en-tête par défaut
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Rechercher" component={SearchScreen} />
      <Tab.Screen name="Bibliothèque" component={LibraryScreen} />
    </Tab.Navigator>
  );
}

// Configurer le Stack Navigator principal
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Le BottomTabNavigator est le premier écran (principal) */}
        <Stack.Screen
          name="Tabs"
          component={BottomTabNavigator}
          options={{ headerShown: false }} // Cacher l'en-tête du TabNavigator
        />

        {/* Ajouter l'écran AlbumScreen dans le Stack */}
        <Stack.Screen
          name="AlbumScreen"
          component={AlbumScreen}
          options={{
            title: "Détails de l'Album", // Titre de l'en-tête
            headerStyle: { backgroundColor: "#1DB954" },
            headerTintColor: "#fff",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

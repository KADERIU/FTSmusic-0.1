// App.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import LibraryScreen from "./src/screens/LibraryScreen";
import AlbumScreen from "./src/screens/AlbumScreen";

// Contexte du lecteur musical utilisant Track Player
import { MusicPlayerProvider } from "./musicPlayers/MusicPlayerContext";

import TrackPlayer, { registerPlaybackService } from "react-native-track-player";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
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
  useEffect(() => {
    async function setupTrackPlayer() {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        stopWithApp: false,
        capabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
          TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
          TrackPlayer.CAPABILITY_STOP,
        ],
        compactCapabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
        ],
      });
    }
    setupTrackPlayer();

    // Enregistrement du service de lecture en arrière-plan
    registerPlaybackService(() => require("./musicPlayers/TrackPlayerService"));
  }, []);

  return (
    <MusicPlayerProvider>
      <NavigationContainer>
        <View style={styles.container}>
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
        </View>
      </NavigationContainer>
    </MusicPlayerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

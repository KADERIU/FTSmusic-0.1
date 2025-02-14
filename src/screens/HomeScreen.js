// ===========================
// screens/HomeScreen.js
// ===========================
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { getHome } from "@hydralerne/youtube-api";
import { useMusicPlayer } from "../../musicPlayers/MusicPlayerContext";
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [homeData, setHomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedTitles, setLikedTitles] = useState([]);

  // --- Utilisation de useFocusEffect pour gérer bottomBarHeight ---
  const { setBottomBarHeight } = useMusicPlayer();
  useFocusEffect(
    React.useCallback(() => {
      setBottomBarHeight(49); // Il y a un menu

      return () => {
        // Optionnel : Remettre à une valeur par défaut si nécessaire
      };
    }, [setBottomBarHeight])
  );

  // Fonction pour récupérer les données
  const fetchData = async () => {
    try {
      const data = await getHome(); // Appel API pour récupérer les titres
      setHomeData(data.picks || []); // Mettre à jour la liste des titres
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(); // Charger les données lors du montage
  }, []);

  // Fonction pour gérer l'actualisation (tirer pour rafraîchir)
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Fonction pour gérer le clic sur un titre
  const handleSongPress = (song) => {
    if (song.albumID) {
      navigation.navigate("AlbumScreen", { albumID: song.albumID }); // Naviguer vers l'écran de l'album
    } else {
      console.error("Album ID manquant pour ce titre.");
    }
  };

  // Fonction pour gérer le like d'un titre
  const handleLike = (song) => {
    if (!likedTitles.some((item) => item.id === song.id)) {
      setLikedTitles([...likedTitles, song]); // Ajouter aux titres likés
    } else {
      setLikedTitles(likedTitles.filter((item) => item.id !== song.id)); // Retirer des titres likés
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Bienvenue!</Text>
      </View>

      {loading ? (
        <View style={styles.container}>
          <Text style={styles.text}>Chargement...</Text>
        </View>
      ) : homeData.length === 0 ? (
        <View style={styles.container}>
          <Text style={styles.text}>Aucune donnée disponible</Text>
        </View>
      ) : (
        <FlatList
          data={homeData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSongPress(item)}>
              <View style={styles.card}>
                <Image source={{ uri: item.poster }} style={styles.image} />
                <View style={styles.details}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.artist}>{item.artist || "Inconnu"}</Text>
                  <Text style={styles.album}>{item.album || "Album inconnu"}</Text>
                </View>
                <TouchableOpacity onPress={() => handleLike(item)}>
                  <Text style={styles.likeButton}>
                    {likedTitles.some((t) => t.id === item.id) ? "❤️" : "🤍"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 46,
    marginBottom: 20,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  text: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  details: {
    flex: 1,
    paddingHorizontal: 15,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  artist: {
    color: "gray",
    fontSize: 16,
    marginBottom: 2,
  },
  album: {
    color: "gray",
    fontSize: 14,
  },
  likeButton: {
    fontSize: 20,
    color: "white",
  },
});

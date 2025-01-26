// =========================== 
// screens/LibraryScreen.js
// ===========================
import React from "react";
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useMusicPlayer } from "../../musicPlayers/MusicPlayerContext";
import { useFocusEffect } from '@react-navigation/native';

export default function LibraryScreen({ route }) {
  const likedTitles = route.params?.likedTitles || [];

  // --- Utilisation de useFocusEffect pour gérer bottomBarHeight ---
  const { setBottomBarHeight } = useMusicPlayer();
  useFocusEffect(
    React.useCallback(() => {
      setBottomBarHeight(24); // Il y a un menu

      return () => {
        // Optionnel : Remettre à une valeur par défaut si nécessaire
      };
    }, [setBottomBarHeight])
  );

  const playlists = [
    { id: "1", title: "Titres likés" },
    { id: "2", title: "Daily Mix 1" },
    { id: "3", title: "Daily Mix 6" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Playlists</Text>
      {playlists.map((playlist) => (
        <View key={playlist.id} style={styles.playlistItem}>
          <Text style={styles.playlistText}>{playlist.title}</Text>
        </View>
      ))}

      {/* Liste des titres likés */}
      {likedTitles.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Titres likés</Text>
          {likedTitles.map((title) => (
            <View key={title.id} style={styles.likedItem}>
              {/* Ajout de l'image et des informations supplémentaires */}
              <Image source={{ uri: title.poster }} style={styles.likedImage} />
              <View style={styles.likedInfoContainer}>
                <Text style={styles.likedTitle}>{title.title}</Text>
                <Text style={styles.likedChannel}>{title.channel}</Text>
              </View>
              <TouchableOpacity style={styles.likeButton}>
                <Text style={styles.likeButtonText}>💔</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 55,
  },
  sectionTitle: {
    fontSize: 18,
    color: "white",
    marginBottom: 10,
  },
  playlistItem: {
    backgroundColor: "#282828",
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
  },
  playlistText: {
    color: "white",
    fontSize: 16,
  },
  likedItem: {
    backgroundColor: "#383838",
    padding: 20,
    marginBottom: 10,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  likedImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  likedInfoContainer: {
    flex: 1,
  },
  likedTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  likedChannel: {
    color: "#bbb",
    fontSize: 14,
  },
  likeButton: {
    padding: 10,
    backgroundColor: "#ff4444",
    borderRadius: 8,
  },
  likeButtonText: {
    color: "white",
    fontSize: 14,
  },
});

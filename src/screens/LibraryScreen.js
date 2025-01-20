import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function LibraryScreen({ route }) {
  // Récupérer les titres likés passés via la navigation
  const likedTitles = route.params?.likedTitles || [];

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
              <Text style={styles.playlistText}>{title.title}</Text>
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
    padding: 30,
    marginBottom: 10,
    borderRadius: 16,
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getAlbum } from "@hydralerne/youtube-api";
import { useMusicPlayer } from "../context/MusicPlayerContext"; // Importer le contexte du lecteur

export default function AlbumScreen({ route }) {
  const { albumID } = route.params; // ID de l'album passé depuis HomeScreen
  const [albumDetails, setAlbumDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useMusicPlayer(); // Accéder à la fonction `playTrack` du contexte

  // Charger les détails de l'album
  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const details = await getAlbum(albumID);
        console.log("Détails de l'album :", details); // Log pour déboguer
        if (details && details.tracks) {
          setAlbumDetails(details);
        } else {
          console.error("Données d'album invalides :", details);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'album :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumDetails();
  }, [albumID]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!albumDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Impossible de charger l'album.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Image de l'album avec bordure bleue */}
      <View style={styles.albumImageContainer}>
        <Image
          source={{ uri: albumDetails.poster || "https://via.placeholder.com/250" }}
          style={styles.albumPoster}
        />
      </View>

      {/* Infos sur l'album */}
      <View style={styles.albumInfoContainer}>
        <Text style={styles.albumTitle}>{albumDetails.name || "Titre inconnu"}</Text>
        <Text style={styles.albumArtist}>
          {albumDetails.artist || "Artiste inconnu"}
        </Text>
        <Text style={styles.albumInfo}>
          {albumDetails.tracks_count || 0} • {albumDetails.tracks_time || "Durée inconnue"}
        </Text>
      </View>

      {/* Liste des morceaux */}
      <FlatList
        data={albumDetails.tracks}
        keyExtractor={(item, index) => item.id || `key-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => playTrack(item.id, item.title)}>
            <View style={styles.track}>
              <Image
                source={{ uri: item.poster || "https://via.placeholder.com/80" }}
                style={styles.trackImage}
              />
              <View style={styles.trackDetails}>
                <Text style={styles.trackTitle}>{item.title || "Titre inconnu"}</Text>
                <Text style={styles.trackPlays}>{item.plays_count || "0 écoutes"}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.text}>Aucun morceau disponible pour cet album.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  text: {
    fontSize: 16,
    color: "white",
  },
  albumImageContainer: {
    marginTop: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  albumPoster: {
    width: 250,
    height: 250,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: "white", // Bordure bleue
  },
  albumInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  albumArtist: {
    fontSize: 18,
    color: "gray",
  },
  albumInfo: {
    fontSize: 16,
    color: "white",
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    color: "white",
  },
  trackPlays: {
    fontSize: 14,
    color: "gray",
  },
});

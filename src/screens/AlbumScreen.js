// screens/AlbumScreen.js
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
import { useFocusEffect } from "@react-navigation/native";

// On importe le contexte
import { useMusicPlayer } from "../../musicPlayers/MusicPlayerContext";

export default function AlbumScreen({ route }) {
  const { albumID } = route.params; // ID de l'album
  const [albumDetails, setAlbumDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // -- On récupère la fonction pour régler la hauteur du mini player --
  // et la fonction playTrack
  const {
    setBottomBarHeight,
    playTrack,
  } = useMusicPlayer();

  // On veut le mini player collé tout en bas => bottomBarHeight = 0
  useFocusEffect(
    React.useCallback(() => {
      setBottomBarHeight(0);
      return () => {
        // Si vous voulez, vous pouvez rétablir la valeur par défaut ici
        // setBottomBarHeight(60);
      };
    }, [setBottomBarHeight])
  );

  // Charger l’album
  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const details = await getAlbum(albumID);
        setAlbumDetails(details);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'album :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumDetails();
  }, [albumID]);

  // Si en cours
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Si pas trouvé
  if (!albumDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Impossible de charger l'album.</Text>
      </View>
    );
  }

  // Rendu des pistes
  return (
    <View style={styles.container}>
      {/* Image principale */}
      <View style={styles.albumImageContainer}>
        <Image source={{ uri: albumDetails.poster }} style={styles.albumPoster} />
      </View>

      {/* Infos sur l'album */}
      <View style={styles.albumInfoContainer}>
        <Text style={styles.albumTitle}>{albumDetails.name}</Text>
        <Text style={styles.albumArtist}>Par {albumDetails.artist}</Text>
        <Text style={styles.albumInfo}>
          {albumDetails.tracks_count} • {albumDetails.tracks_time}
        </Text>
      </View>

      {/* Liste des morceaux */}
      <FlatList
        data={albumDetails.tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              // Lecture via le context
              playTrack(item.id, item.title, item.poster)
            }
          >
            <View style={styles.track}>
              <Image source={{ uri: item.poster }} style={styles.trackImage} />
              <View style={styles.trackDetails}>
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.trackPlays}>{item.plays_count}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
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
    color: "#fff",
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
    borderColor: "white",
  },
  albumInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  albumArtist: {
    fontSize: 18,
    color: "gray",
    marginBottom: 5,
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
    marginRight: 15,
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

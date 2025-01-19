import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Audio } from "expo-av"; // Librairie pour le lecteur audio
import { getAlbum, getData, filter } from "@hydralerne/youtube-api";

export default function AlbumScreen({ route }) {
  const { albumID } = route.params; // ID de l'album passé depuis HomeScreen
  const [albumDetails, setAlbumDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false); // État pour vérifier si la musique joue
  const [currentTrack, setCurrentTrack] = useState(null); // Stocker la piste actuelle
  const audioPlayer = useRef(new Audio.Sound()); // Référence au lecteur audio

  // Charger les détails de l'album
  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const details = await getAlbum(albumID); // Appeler l'API pour récupérer l'album
        setAlbumDetails(details);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'album :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumDetails();
  }, [albumID]);

  // Fonction pour jouer une chanson
  const playTrack = async (trackId, trackTitle) => {
    try {
      // Récupérer les formats audio avec getData
      const formats = await getData(trackId);
      const bestAudio = filter(formats, "bestaudio", {
        minBitrate: 128000,
        codec: "mp4a",
      });

      // Vérifier si une URL audio est disponible
      if (!bestAudio || !bestAudio.url) {
        Alert.alert("Erreur", "Impossible de récupérer l'audio pour cette chanson.");
        return;
      }

      // Arrêter le lecteur audio s'il joue une autre chanson
      if (audioPlayer.current) {
        await audioPlayer.current.unloadAsync();
      }

      // Charger la nouvelle chanson et jouer
      await audioPlayer.current.loadAsync({ uri: bestAudio.url }, {}, true);
      await audioPlayer.current.playAsync();

      setCurrentTrack(trackTitle); // Mettre à jour la piste en cours
      setIsPlaying(true); // Mettre à jour l'état de lecture
    } catch (error) {
      console.error("Erreur lors de la lecture du morceau :", error);
      Alert.alert("Erreur", "Impossible de lire le morceau.");
    }
  };

  // Fonction pour mettre en pause la musique
  const pauseTrack = async () => {
    try {
      await audioPlayer.current.pauseAsync();
      setIsPlaying(false); // Mettre à jour l'état de lecture
    } catch (error) {
      console.error("Erreur lors de la pause :", error);
    }
  };

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
      {/* Image principale de l'album */}
      <View style={styles.albumImageContainer}>
        <Image
          source={{ uri: albumDetails.poster }}
          style={styles.albumPoster}
        />
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
          <TouchableOpacity onPress={() => playTrack(item.id, item.title)}>
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

      {/* Lecteur audio minimal */}
      {currentTrack && (
        <View style={styles.audioPlayer}>
          <Text style={styles.currentTrack}>{currentTrack}</Text>
          <TouchableOpacity
            onPress={isPlaying ? pauseTrack : () => playTrack(currentTrack.id, currentTrack)}
          >
            <Text style={styles.playPauseButton}>
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
  audioPlayer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#1E1E1E",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentTrack: {
    color: "white",
    fontSize: 16,
  },
  playPauseButton: {
    color: "#1DB954",
    fontSize: 18,
    fontWeight: "bold",
  },
});

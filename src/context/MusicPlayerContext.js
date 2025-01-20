import React, { createContext, useContext, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { Audio } from "expo-av";
import { getData, filter } from "@hydralerne/youtube-api";

const MusicPlayerContext = createContext();

export const MusicPlayerProvider = ({ children }) => {
  const audioPlayer = useRef(new Audio.Sound());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const playTrack = async (trackId, trackTitle, trackArtist) => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      // Récupérer les données du track depuis YouTube
      const formats = await getData(trackId);
      if (!formats || formats.length === 0) {
        alert("Aucun format audio disponible.");
        return;
      }

      // Filtrer pour récupérer le meilleur format audio
      const bestAudio = filter(formats, "bestaudio", {
        minBitrate: 128000,
        codec: "mp4a",
      });

      if (!bestAudio || !bestAudio.url) {
        alert("Impossible de récupérer l'audio.");
        return;
      }

      // Définir l'URL de la miniature (poster)
      const posterUrl = `https://i.ytimg.com/vi/${trackId}/maxresdefault.jpg`;

      // Décharger l'audio précédent (si existant)
      if (audioPlayer.current) {
        await audioPlayer.current.unloadAsync();
      }

      // Charger et jouer le nouvel audio
      await audioPlayer.current.loadAsync({ uri: bestAudio.url }, {}, true);
      await audioPlayer.current.playAsync();

      // Mettre à jour les informations sur la piste en cours
      setCurrentTrack({
        id: trackId,
        title: trackTitle,
        poster: posterUrl, // Utiliser l'URL générée de la miniature
        artist: trackArtist,
      });
      setIsPlaying(true);
    } catch (error) {
      console.error("Erreur de lecture :", error);
    } finally {
      setIsBusy(false);
    }
  };

  const pauseTrack = async () => {
    try {
      if (audioPlayer.current) {
        await audioPlayer.current.pauseAsync();
        setIsPlaying(false);
      } else {
        console.warn("Le lecteur audio n'est pas initialisé.");
      }
    } catch (error) {
      console.error("Erreur lors de la pause :", error);
    }
  };

  return (
    <MusicPlayerContext.Provider value={{ playTrack, pauseTrack, currentTrack, isPlaying }}>
      <View style={{ flex: 1 }}>
        {children}
        {currentTrack && <MiniPlayer />} {/* Affiche le MiniPlayer */}
      </View>
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer doit être utilisé à l'intérieur de MusicPlayerProvider");
  }
  return context;
};

const MiniPlayer = () => {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useMusicPlayer();
  const [isExpanded, setIsExpanded] = useState(false); // Gère l'état étendu/réduit

  return (
    <TouchableWithoutFeedback onPress={() => setIsExpanded(!isExpanded)}>
      <View style={[styles.miniPlayerContainer, isExpanded && styles.expanded]}>
        {isExpanded ? (
          // Mode étendu
          <View style={styles.expandedContent}>
            {/* Image de l'album */}
            <Image
              source={{ uri: currentTrack?.poster || "https://via.placeholder.com/250" }}
              style={styles.albumArt}
            />
            {/* Infos sur la musique */}
            <View style={styles.trackInfo}>
              <Text style={styles.expandedTrackTitle}>{currentTrack?.title || "Titre inconnu"}</Text>
              <Text style={styles.expandedArtist}>{currentTrack?.artist || "Artiste inconnu"}</Text>
            </View>
            {/* Barre de progression */}
            <View style={styles.progressBar}>
              <Text style={styles.time}>0:00</Text>
              <View style={styles.progressLineBackground}>
                <View style={styles.progressLine} />
              </View>
              <Text style={styles.time}>2:04</Text>
            </View>
            {/* Contrôles de lecture */}
            <View style={styles.controls}>
              <TouchableOpacity>
                <Text style={styles.controlIcon}>⏮</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  isPlaying
                    ? pauseTrack()
                    : playTrack(
                        currentTrack.id,
                        currentTrack.title,
                        currentTrack.artist
                      )
                }
              >
                <Text style={styles.playPauseButton}>
                  {isPlaying ? "⏸️" : "▶️"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.controlIcon}>⏭</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Mode réduit
          <View style={styles.collapsedContent}>
            <Text style={styles.trackTitle}>{currentTrack?.title || "Aucune piste en cours"}</Text>
            <TouchableOpacity
              onPress={() =>
                isPlaying
                  ? pauseTrack()
                  : playTrack(
                      currentTrack.id,
                      currentTrack.title,
                      currentTrack.artist
                    )
              }
            >
              <Text style={styles.playPauseButton}>{isPlaying ? "⏸️ Pause" : "▶️ Play"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  miniPlayerContainer: {
    position: "absolute",
    bottom: 49,
    left: 0,
    right: 0,
    backgroundColor: "#1E1E1E",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  expanded: {
    height: "100%", // Plein écran
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  collapsedContent: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expandedContent: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  albumArt: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  trackTitle: {
    color: "white",
    fontSize: 16,
    flex: 1,
  },
  playPauseButton: {
    fontSize: 18,
    color: "#1DB954",
    fontWeight: "bold",
  },
  expandedTrackTitle: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  expandedArtist: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
  },
  time: {
    color: "gray",
    fontSize: 14,
  },
  progressLineBackground: {
    flex: 1,
    height: 4,
    backgroundColor: "gray",
    marginHorizontal: 10,
    borderRadius: 2,
  },
  progressLine: {
    width: "50%", // Exemple : 50% de progression
    height: 4,
    backgroundColor: "#1DB954",
    borderRadius: 2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "60%",
  },
  controlIcon: {
    fontSize: 30,
    color: "white",
  },
});

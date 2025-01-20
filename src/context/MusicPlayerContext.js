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

// Contexte pour le lecteur audio
const MusicPlayerContext = createContext();

// Fournisseur du contexte pour le lecteur audio
export const MusicPlayerProvider = ({ children }) => {
  // Référence au lecteur audio d'Expo AV
  const audioPlayer = useRef(new Audio.Sound());

  // État pour la piste en cours
  const [currentTrack, setCurrentTrack] = useState(null);

  // État pour savoir si une piste est en lecture
  const [isPlaying, setIsPlaying] = useState(false);

  // État pour indiquer si une opération est en cours (évite les conflits)
  const [isBusy, setIsBusy] = useState(false);

  // Fonction pour lire une piste
  const playTrack = async (trackId, trackTitle, trackArtist) => {
    if (isBusy) return; // Évite d'exécuter plusieurs fois si une opération est en cours
    setIsBusy(true); // Indique qu'une opération est en cours

    try {
      // Récupérer les données de la vidéo à partir de l'API YouTube
      const formats = await getData(trackId);

      // Vérifier si des formats audio sont disponibles
      if (!formats || formats.length === 0) {
        alert("Aucun format audio disponible.");
        return;
      }

      // Filtrer pour obtenir le meilleur format audio
      const bestAudio = filter(formats, "bestaudio", {
        minBitrate: 128000, // Débit minimum de 128 kbps
        codec: "mp4a", // Codec audio MP4A
      });

      // Vérifier si une URL audio est disponible
      if (!bestAudio || !bestAudio.url) {
        alert("Impossible de récupérer l'audio.");
        return;
      }

      // Générer l'URL de la miniature à partir de l'ID de la vidéo
      const posterUrl = `https://i.ytimg.com/vi/${trackId}/maxresdefault.jpg`;

      // Si un audio est déjà chargé, déchargez-le
      if (audioPlayer.current) {
        await audioPlayer.current.unloadAsync();
      }

      // Charger et lire le nouvel audio
      await audioPlayer.current.loadAsync({ uri: bestAudio.url }, {}, true);
      await audioPlayer.current.playAsync();

      // Mettre à jour les informations sur la piste en cours
      setCurrentTrack({
        id: trackId, // ID de la vidéo
        title: trackTitle || "Titre inconnu", // Titre de la piste
        poster: posterUrl, // URL de la miniature
        artist: trackArtist || "Artiste inconnu", // Nom de l'artiste
      });

      // Indiquer que la piste est en lecture
      setIsPlaying(true);
    } catch (error) {
      console.error("Erreur de lecture :", error);
    } finally {
      // Réinitialiser l'état "occupé" après l'opération
      setIsBusy(false);
    }
  };

  // Fonction pour mettre en pause la lecture
  const pauseTrack = async () => {
    try {
      if (audioPlayer.current) {
        // Met en pause la lecture audio
        await audioPlayer.current.pauseAsync();
        setIsPlaying(false); // Met à jour l'état de lecture
      } else {
        console.warn("Le lecteur audio n'est pas initialisé.");
      }
    } catch (error) {
      console.error("Erreur lors de la pause :", error);
    }
  };

  // Fournit les fonctions et états du lecteur audio à tous les enfants
  return (
    <MusicPlayerContext.Provider value={{ playTrack, pauseTrack, currentTrack, isPlaying }}>
      <View style={{ flex: 1 }}>
        {children}
        {/* Affiche le mini-lecteur si une piste est en cours */}
        {currentTrack && <MiniPlayer />}
      </View>
    </MusicPlayerContext.Provider>
  );
};

// Hook pour accéder au contexte du lecteur audio
export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer doit être utilisé à l'intérieur de MusicPlayerProvider");
  }
  return context;
};

// Composant pour afficher le mini-lecteur
const MiniPlayer = () => {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useMusicPlayer();
  const [isExpanded, setIsExpanded] = useState(false); // Gère l'état étendu/réduit du lecteur

  return (
    <TouchableWithoutFeedback onPress={() => setIsExpanded(!isExpanded)}>
      <View style={[styles.miniPlayerContainer, isExpanded && styles.expanded]}>
        {isExpanded ? (
          // Mode étendu
          <View style={styles.expandedContent}>
            {/* Image de l'album */}
            <Image
            source={{
            uri: currentTrack?.poster || "https://img.freepik.com/photos-premium/fond-ecran-abstrait-notes-musique-vibrantes_800563-1835.jpg"
            }}
            style={styles.albumArt}
            />

            
            {/* Infos sur la musique */}
            <View style={styles.trackInfo}>
              <Text style={styles.expandedTrackTitle}>{currentTrack?.title}</Text>
              <Text style={styles.expandedArtist}>{currentTrack?.artist}</Text>
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
            <Text style={styles.trackTitle}>{currentTrack?.title}</Text>
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
                {isPlaying ? "⏸️ Pause" : "▶️ Play"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

// Styles pour les composants
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
    height: "90%", // Plein écran
    padding: 30,
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

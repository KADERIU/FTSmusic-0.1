// ===========================
// screens/AlbumScreen.js
// ===========================
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { getAlbum } from "@hydralerne/youtube-api";
import { useMusicPlayer } from "../../musicPlayers/MusicPlayerContext";
import { useFocusEffect } from '@react-navigation/native';

export default function AlbumScreen({ route }) {
  // On reçoit l'albumID en paramètre
  const { albumID } = route.params;

  // État pour les détails de l'album
  const [albumDetails, setAlbumDetails] = useState(null);
  // Pour afficher un loader au départ
  const [loading, setLoading] = useState(true);

  // On récupère isBusy, playTrack, etc. depuis le contexte
  const { isBusy, playTrack, updateTracksList, setBottomBarHeight } = useMusicPlayer();

  // --- Gestion dynamique de bottomBarHeight via useFocusEffect ---
  useFocusEffect(
    React.useCallback(() => {
      setBottomBarHeight(0); // Pas de menu

      return () => {
        // Optionnel : Remettre à une valeur par défaut si nécessaire
      };
    }, [setBottomBarHeight])
  );

  // Charger l'album au montage
  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const details = await getAlbum(albumID);
        if (details && details.tracks) {
          setAlbumDetails(details);
        } else {
          console.error("Données album invalides :", details);
        }
      } catch (error) {
        console.error("Erreur getAlbum :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumDetails();
  }, [albumID]);

  // Une fois qu'on a les détails, on met la liste dans le player
  useEffect(() => {
    if (albumDetails && albumDetails.tracks && albumDetails.tracks.length > 0) {
      const mappedTracks = albumDetails.tracks.map((t) => ({
        id: t.id,
        title: t.title,
        poster: t.poster,
      }));
      updateTracksList(mappedTracks);
    }
  }, [albumDetails]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!albumDetails) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Impossible de charger l'album.</Text>
      </View>
    );
  }

  // On récupère le poster de l'album (ou un placeholder)
  const albumPoster = albumDetails.poster || "https://via.placeholder.com/800";

  return (
    // On va utiliser ImageBackground pour mettre le poster flou en fond
    <View style={styles.container}>
      {/* Fond flou */}
      <ImageBackground
        source={{ uri: albumPoster }}
        style={styles.backgroundImage}
        blurRadius={25} // Ajuste l'intensité du flou (0 = pas de flou, 20+ = très flou)
        resizeMode="cover"
      >
        {/* Overlay sombre pour atténuer l'image floue et rendre le texte lisible */}
        <View style={styles.overlay} />

        {/* Contenu principal par-dessus */}
        <View style={styles.contentContainer}>
          {/* Image en clair (non floue) */}
          <View style={styles.albumImageContainer}>
            <Image
              source={{ uri: albumPoster }}
              style={styles.albumPoster}
              resizeMode="cover"
            />
          </View>

          {/* Infos sur l'album */}
          <View style={styles.albumInfoContainer}>
            <Text style={styles.albumTitle}>
              {albumDetails.name || "Titre inconnu"}
            </Text>
            <Text style={styles.albumArtist}>
              {albumDetails.artist || "Artiste inconnu"}
            </Text>
            <Text style={styles.albumInfo}>
              {albumDetails.tracks_count || 0} pistes •{" "}
              {albumDetails.tracks_time || "Durée inconnue"}
            </Text>
          </View>

          {/* Liste des pistes */}
          <FlatList
            data={albumDetails.tracks}
            keyExtractor={(item, index) => item.id || `track-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (!isBusy) {
                    playTrack(item.id, item.title, item.poster);
                  }
                }}
                style={styles.trackItem}
              >
                {/* Petite vignette de piste, si tu veux */}
                <Image
                  source={{ uri: item.poster || "https://via.placeholder.com/50" }}
                  style={styles.trackImage}
                />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.errorText}>
                Aucun morceau disponible pour cet album.
              </Text>
            }
            // Pour que la liste défile : on met un marginBottom pour éviter
            // d'écraser le miniplayer si besoin
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

// ======================
// STYLES
// ======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
  },

  // L'image de fond floue
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    // on occupe tout l'espace
  },

  // Overlay sombre
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)", // un voile noir à 50% d'opacité
  },

  // Conteneur principal du contenu
  contentContainer: {
    flex: 1,
    // On met un peu de padding horizontal
    paddingHorizontal: 20,
    // On peut espacer un peu en haut
    paddingTop: 40,
  },

  // Image de l'album en avant-plan
  albumImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  albumPoster: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },

  // Texte d'infos album
  albumInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  albumTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  albumArtist: {
    color: "#ccc",
    fontSize: 16,
  },
  albumInfo: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 5,
  },

  // Liste des pistes
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.2)",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: "#fff",
    fontSize: 16,
  },
});

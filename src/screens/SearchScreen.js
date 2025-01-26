// ===========================
// screens/SearchScreen.js
// ===========================
import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Image,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useMusicPlayer } from "../../musicPlayers/MusicPlayerContext";
import { useFocusEffect } from '@react-navigation/native';

export default function SearchScreen() {
  // Le texte de la recherche
  const [query, setQuery] = useState("");
  // La liste de suggestions (videos)
  const [suggestions, setSuggestions] = useState([]);
  // isFocused pour styliser le logo ou autre
  const [isFocused, setIsFocused] = useState(false);

  // On récupère la fonction playTrack et updateTracksList
  const { isBusy, playTrack, updateTracksList, setBottomBarHeight } = useMusicPlayer();

  // -- Gestion dynamique de bottomBarHeight via useFocusEffect --
  useFocusEffect(
    React.useCallback(() => {
      setBottomBarHeight(24); // Il y a un menu

      return () => {
        // Optionnel : Remettre à une valeur par défaut si nécessaire
      };
    }, [setBottomBarHeight])
  );

  // On veut jusqu'à 30 résultats
  const MAX_RESULTS = 30;

  // fetchSuggestions : requête YouTube
  const fetchSuggestions = async (text) => {
    setQuery(text);

    // Si c'est vide, on efface
    if (text.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    try {
      // URL de recherche
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        text
      )}`;
      // Headers
      const headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      };

      // Requête
      const response = await axios.get(searchUrl, { headers });
      const htmlContent = response.data;

      // On parse le JSON (ytInitialData)
      const videoDataMatch = htmlContent.match(/var ytInitialData = (\{.*?\});/);
      if (!videoDataMatch) {
        setSuggestions([]);
        return;
      }

      const data = JSON.parse(videoDataMatch[1]);
      const contents =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
          ?.sectionListRenderer?.contents;

      const videoResults = [];
      contents?.forEach((section) => {
        const items = section.itemSectionRenderer?.contents;
        if (items) {
          items.forEach((item) => {
            if (item.videoRenderer) {
              // On récupère l'id, le titre
              const videoId = item.videoRenderer.videoId;
              const title =
                item.videoRenderer.title.runs[0]?.text ||
                "Titre non disponible";

              // On prend la plus large miniature => meilleure qualité
              const thumbArray = item.videoRenderer.thumbnail?.thumbnails || [];
              const bigThumb = thumbArray.reduce((acc, el) => {
                return el.width > (acc.width || 0) ? el : acc;
              }, {});
              const thumbnailUrl = bigThumb.url || "";

              videoResults.push({
                id: videoId,
                title,
                thumbnail: thumbnailUrl,
              });
            }
          });
        }
      });

      // On limite à MAX_RESULTS
      const resultsLimited = videoResults.slice(0, MAX_RESULTS);
      setSuggestions(resultsLimited);
    } catch (error) {
      console.error("Erreur fetchSuggestions:", error);
      setSuggestions([]);
    }
  };

  // Quand on clique sur le bouton vert
  const handlePressSearchButton = () => {
    // On met en queue toutes les suggestions
    updateTracksList(
      suggestions.map((v) => ({
        id: v.id,
        title: v.title,
        poster: v.thumbnail,
      }))
    );
    // On ferme le clavier
    Keyboard.dismiss();
  };

  // Rendu d'un item
  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (isBusy) return;
        // Lecture directe
        playTrack(item.id, item.title, item.thumbnail);
        Keyboard.dismiss();
      }}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.itemTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Logo au dessus */}
      <View style={[styles.logoContainer, isFocused && styles.logoContainerSmall]}>
        <Image
          source={require("../../assets/FTSmusic_logo.png")} // Remplace par ton logo
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={fetchSuggestions}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            Keyboard.dismiss();
          }}
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handlePressSearchButton}>
          <MaterialIcons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Liste des résultats */}
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={renderSuggestion}
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

// Styles basiques
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  logoContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  logoContainerSmall: {
    marginTop: 30,
    marginBottom: 10,
  },
  logoImage: {
    width: 120,
    height: 60,
  },
  searchBar: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#282828",
    color: "white",
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: "#1DB954",
    borderRadius: 10,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 4,
  },
  itemTitle: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
});

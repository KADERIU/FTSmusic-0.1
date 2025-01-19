import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

export default function SearchScreen() {
  const [query, setQuery] = useState(""); // La requête de recherche
  const [suggestions, setSuggestions] = useState([]); // Les résultats de suggestions

  // Fonction pour récupérer les suggestions de vidéos
  const fetchSuggestions = async (text) => {
    setQuery(text);

    if (text.trim().length === 0) {
      setSuggestions([]); // Vider les suggestions si la saisie est vide
      return;
    }

    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        text
      )}`;

      const headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      };

      const response = await axios.get(searchUrl, { headers });
      const htmlContent = response.data;

      // Extraire le JSON contenant les données vidéo
      const videoDataMatch = htmlContent.match(
        /var ytInitialData = (\{.*?\});/
      );
      if (!videoDataMatch) {
        setSuggestions([]); // Aucune suggestion si le JSON est introuvable
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
              const videoId = item.videoRenderer.videoId;
              const title =
                item.videoRenderer.title.runs[0]?.text || "Titre non disponible";
              const url = `https://www.youtube.com/watch?v=${videoId}`;

              videoResults.push({ id: videoId, title, url });
            }
          });
        }
      });

      setSuggestions(videoResults);
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions :", error);
      setSuggestions([]);
    }
  };

  // Fonction pour rendre chaque suggestion
  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => console.log(`Video URL: ${item.url}`)} // Modifier selon vos besoins
    >
      <Text style={styles.suggestionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Logo fixe en haut */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/FTSmusic_logo.png")} // Chemin vers votre image de logo
          style={styles.logoImage}
        />
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={query}
          onChangeText={fetchSuggestions}
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton}>
          <MaterialIcons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Liste des suggestions */}
      <FlatList
        data={suggestions.slice(0, 5)} // Limite à 5 suggestions visibles
        keyExtractor={(item) => item.id || item} // `item.id` pour suggestions
        renderItem={renderSuggestion}
        style={styles.suggestionList}
        contentContainerStyle={styles.suggestionListContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
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
    marginLeft: 10,
    backgroundColor: "#1DB954",
    borderRadius: 10,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionList: {
    width: "100%",
  },
  suggestionItem: {
    padding: 15,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  suggestionText: {
    color: "white",
    fontSize: 16,
  },
});

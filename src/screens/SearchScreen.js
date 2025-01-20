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

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false); // Nouvel état pour gérer la mise au point

  const fetchSuggestions = async (text) => {
    setQuery(text);

    if (text.trim().length === 0) {
      setSuggestions([]);
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

      const videoDataMatch = htmlContent.match(
        /var ytInitialData = (\{.*?\});/
      );
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

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => console.log(`Video URL: ${item.url}`)}
    >
      <Text style={styles.suggestionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, isFocused && styles.logoContainerSmall]}>
        <Image
          source={require("../../assets/FTSmusic_logo.png")}
          style={[styles.logoImage, isFocused && styles.logoImageSmall]}
        />
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={query}
          onChangeText={fetchSuggestions}
          onFocus={() => setIsFocused(true)} // Réduit le logo et ajuste la barre de recherche
          onBlur={() => {
            setIsFocused(false); // Rétablit les styles par défaut
            Keyboard.dismiss();
          }}
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton}>
          <MaterialIcons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={suggestions.slice(0, 5)}
        keyExtractor={(item) => item.id || item}
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
  logoContainerSmall: {
    marginTop: 50,
    marginBottom: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  logoImageSmall: {
    width: 60,
    height: 60,
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

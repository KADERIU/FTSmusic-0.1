// ===========================
// musicPlayers/designemusicplayer.js
// ===========================

import { StyleSheet } from "react-native";

// Création des styles pour le MiniPlayer et le lecteur en plein écran
export const styles = StyleSheet.create({
  // Container principal du MiniPlayer
  miniPlayerContainer: {
    position: "absolute", // Position absolue pour superposer le MiniPlayer en bas de l'écran
    left: 0,              // Aligné à gauche
    right: 0,             // Aligné à droite
    backgroundColor: "#1E1E1E", // Couleur de fond sombre
    borderTopWidth: 1,    // Bordure supérieure pour délimiter le MiniPlayer
    borderTopColor: "#333", // Couleur de la bordure supérieure
  },

  // Contenu du MiniPlayer lorsqu'il est réduit (mode compact)
  collapsedContent: {
    flexDirection: "row", // Alignement horizontal des éléments
    alignItems: "center", // Centrage vertical des éléments
    padding: 10,          // Espacement interne
  },

  // Style de l'image de l'album dans le MiniPlayer compact
  miniAlbumArt: {
    width: 40,             // Largeur de l'image
    height: 40,            // Hauteur de l'image
    borderRadius: 4,       // Coins légèrement arrondis
    marginRight: 8,        // Espacement à droite de l'image
  },

  // Section gauche du MiniPlayer compact (titre de la piste)
  collapsedLeft: {
    flex: 1,              // Prend tout l'espace disponible horizontalement
    justifyContent: "center", // Centre verticalement le contenu
  },

  // Section centrale du MiniPlayer compact (bouton Play/Pause)
  collapsedCenter: {
    width: 50,                  // Largeur fixe pour le bouton
    flexDirection: "row",       // Alignement horizontal des icônes si besoin
    justifyContent: "center",   // Centre horizontalement
    alignItems: "center",       // Centre verticalement
    marginRight: 8,             // Espacement à droite
  },

  // Section droite du MiniPlayer compact (bouton Cœur)
  collapsedRight: {
    width: 40,             // Largeur fixe pour le bouton
    justifyContent: "center", // Centre horizontalement
    alignItems: "center",     // Centre verticalement
  },

  // Style du titre de la piste dans le MiniPlayer compact
  trackTitle: {
    color: "#fff",        // Couleur du texte en blanc
    fontSize: 16,         // Taille de la police
    paddingRight: 10,     // Espacement à droite
  },

  // Style du nom de la chaîne dans le MiniPlayer compact
  channelName: {
    color: "#bbb",        // Couleur claire pour contraster avec le fond sombre
    fontSize: 14,         // Taille de la police légèrement plus petite
    marginTop: 0,         // Espacement au-dessus du texte
  },

  // ===============================
  // Styles pour le Mode Plein Écran
  // ===============================

  // Contenu du lecteur en plein écran
  expandedContent: {
    flex: 1,              // Prend tout l'espace disponible
    alignItems: "center", // Centre horizontalement les éléments
    paddingTop: 99,       // Espacement en haut (peut être trop élevé)
  },

  // Bouton de fermeture du lecteur plein écran
  closeButton: {
    position: "absolute", // Position absolue pour superposer le bouton
    top: 50,              // Distance du haut (peut varier selon la taille de l'écran)
    right: 30,            // Distance de la droite
  },

  // Style de l'image de l'album en plein écran
  albumArt: {
    width: 300,             // Largeur de l'image
    height: 300,            // Hauteur de l'image
    borderRadius: 10,       // Coins arrondis
    marginBottom: 20,       // Espacement en bas
  },

  // Style du titre de la piste en plein écran
  expandedTrackTitle: {
    color: "#fff",           // Couleur du texte en blanc
    fontSize: 20,            // Taille de la police
    fontWeight: "bold",      // Texte en gras
    textAlign: "center",     // Centrage du texte
    marginBottom: 40,        // Espacement en bas
  },

  // Conteneur pour le Slider de progression
  progressContainer: {
    width: "95%",           // Largeur relative
    alignItems: "center",   // Centre horizontalement
    marginBottom: 20,       // Espacement en bas
  },

  // Style du Slider de progression
  slider: {
    width: "105%",          // Largeur légèrement supérieure à 100% pour éviter le clipping
    height: 40,             // Hauteur du Slider
  },

  // Conteneur pour afficher les temps (actuel et total)
  timesRow: {
    flexDirection: "row",          // Alignement horizontal
    justifyContent: "space-between", // Espacement entre les temps
    width: "97%",                  // Largeur presque complète
    marginTop: 0,                  // Aucun espacement en haut
  },

  // Style des textes de temps
  timeText: {
    color: "#fff",           // Couleur du texte en blanc
    fontSize: 12,            // Taille de la police
  },

  // Conteneur pour les contrôles de lecture
  controls: {
    flexDirection: "row",       // Alignement horizontal des boutons
    alignItems: "center",       // Centre verticalement
    marginTop: 40,              // Espacement en haut
  },
});

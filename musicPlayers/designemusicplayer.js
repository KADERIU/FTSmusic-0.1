// musicPlayers/designemusicplayer.js
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // ========== MINI PLAYER ==========
  miniPlayerContainer: {
    backgroundColor: "#1E1E1E",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  collapsedContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  miniAlbumArt: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
  },
  collapsedLeft: {
    flex: 1,
    justifyContent: "center",
  },
  collapsedCenter: {
    width: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  collapsedRight: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  trackTitle: {
    color: "#fff",
    fontSize: 16,
    paddingRight: 10,
  },
  channelName: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 0,
  },

  // ========== PLEIN ÉCRAN ==========
  expandedContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // ou "flex-start" si tu préfères
    paddingHorizontal: 20,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 30,
  },

  // Bouton caméra (pour le placer en haut à gauche, par ex.)
  cameraButton: {
    position: "absolute",
    top: 50,
    left: 30,
  },

  albumArt: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  expandedTrackTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 0,
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
});
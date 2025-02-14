// musicPlayers/MiniPlayer.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useMusicPlayer } from "./MusicPlayerContext";
import { styles } from "./designemusicplayer"; // Vos styles personnalisés

const { width, height } = Dimensions.get("window");

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    isBusy,
    playTrack,
    pauseTrack,
    playNextTrack,
    playPreviousTrack,
    cycleRepeatMode,
    isLooping,
    isRandom,
    position,
    duration,
    seekToPosition,
    resumeTrack,
    isFullScreenPlayer,
    setIsFullScreenPlayer,
  } = useMusicPlayer();

  const sliderValue = position;

  const formatTime = (millis) => {
    const sec = Math.floor(millis / 1000);
    const mins = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${mins}:${s}`;
  };

  const handleSlidingStart = () => {
    pauseTrack();
  };

  const handleSlidingComplete = async (val) => {
    await seekToPosition(val);
    await resumeTrack();
  };

  // Récupère la pochette du morceau ou une image par défaut
  const getPoster = () => {
    if (!currentTrack || !currentTrack.artwork) {
      return require("../assets/MusiqueI.png");
    }
    return { uri: currentTrack.artwork };
  };

  return (
    <View style={{ flex: 1 }}>
      {currentTrack && (
        <>
          {!isFullScreenPlayer ? (
            <View style={styles.miniPlayerContainer}>
              <View style={styles.collapsedContent}>
                <Image source={getPoster()} style={styles.miniAlbumArt} />
                <TouchableOpacity
                  style={styles.collapsedLeft}
                  onPress={() => setIsFullScreenPlayer(true)}
                >
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {currentTrack.title}
                  </Text>
                  <Text style={styles.channelName} numberOfLines={1}>
                    {currentTrack.artist}
                  </Text>
                </TouchableOpacity>
                <View style={styles.collapsedCenter}>
                  <TouchableOpacity
                    onPress={() => {
                      if (isPlaying) {
                        pauseTrack();
                      } else {
                        resumeTrack();
                      }
                    }}
                  >
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={24}
                      color="#1DB954"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.collapsedRight}>
                  <Ionicons name="heart-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={localStyles.overlayContainer}>
              <ImageBackground
                source={getPoster()}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                blurRadius={20}
              />
              <View style={localStyles.overlay} pointerEvents="none" />
              <View style={styles.expandedContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsFullScreenPlayer(false)}
                >
                  <Ionicons name="chevron-down" size={24} color="#fff" />
                </TouchableOpacity>
                <Image source={getPoster()} style={styles.albumArt} />
                <Text style={styles.expandedTrackTitle}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.channelName}>
                  {currentTrack.artist}
                </Text>
                <View style={styles.progressContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={sliderValue}
                    onSlidingStart={handleSlidingStart}
                    onSlidingComplete={handleSlidingComplete}
                    minimumTrackTintColor="#1DB954"
                    maximumTrackTintColor="#fff"
                    thumbTintColor="#1DB954"
                  />
                  <View style={styles.timesRow}>
                    <Text style={styles.timeText}>
                      {formatTime(sliderValue)}
                    </Text>
                    <Text style={styles.timeText}>
                      {formatTime(duration)}
                    </Text>
                  </View>
                </View>
                <View style={styles.controls}>
                  <TouchableOpacity
                    onPress={cycleRepeatMode}
                    style={{ marginRight: 20 }}
                  >
                    {isLooping ? (
                      <Ionicons name="repeat" size={28} color="#fff" />
                    ) : isRandom ? (
                      <Ionicons name="shuffle" size={28} color="#fff" />
                    ) : (
                      <Ionicons
                        name="arrow-forward-circle-outline"
                        size={28}
                        color="#fff"
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (!isBusy) playPreviousTrack();
                    }}
                  >
                    <Ionicons name="play-skip-back" size={30} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginHorizontal: 20 }}
                    onPress={() => {
                      if (isPlaying) {
                        pauseTrack();
                      } else {
                        resumeTrack();
                      }
                    }}
                  >
                    <Ionicons
                      name={isPlaying ? "pause-circle" : "play-circle"}
                      size={64}
                      color="#1DB954"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (!isBusy) playNextTrack();
                    }}
                    style={{ marginRight: 20 }}
                  >
                    <Ionicons name="play-skip-forward" size={30} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="heart-outline" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  overlayContainer: {
    width,
    height,
    position: "absolute",
    top: 0,
    left: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});

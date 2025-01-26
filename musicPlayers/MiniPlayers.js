import React, { useState, useEffect } from "react";
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
import { styles } from "./designemusicplayer";

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
    isFullScreenPlayer,
    setIsFullScreenPlayer,
    bottomBarHeight,
  } = useMusicPlayer();

  const [localPosition, setLocalPosition] = useState(position);

  useEffect(() => {
    setLocalPosition(position);
  }, [position]);

  const formatTime = (millis) => {
    const sec = Math.floor(millis / 1000);
    const mins = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${mins}:${s}`;
  };

  const handleValueChange = (val) => {
    setLocalPosition(val);
  };
  const handleSlidingComplete = (val) => {
    seekToPosition(val);
  };

  const getPoster = () => {
    if (!currentTrack?.poster) {
      return require("../assets/MusiqueI.png");
    }
    return { uri: currentTrack.poster };
  };

  if (!currentTrack) return null;

  // ========== MODE REDUIT ==========
  if (!isFullScreenPlayer) {
    return (
      <View style={[styles.miniPlayerContainer, { bottom: bottomBarHeight }]}>
        <View style={styles.collapsedContent}>
          {/* Image */}
          <Image source={getPoster()} style={styles.miniAlbumArt} />

          {/* Titre (clic => plein écran) */}
          <TouchableOpacity
            style={styles.collapsedLeft}
            onPress={() => setIsFullScreenPlayer(true)}
          >
            <Text style={styles.trackTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.channelName} numberOfLines={1}>
              {currentTrack.channel}
            </Text>
          </TouchableOpacity>

          {/* Bouton Play/Pause */}
          <View style={styles.collapsedCenter}>
            <TouchableOpacity
              onPress={() => {
                if (isPlaying) {
                  pauseTrack();
                } else {
                  playTrack(
                    currentTrack.id,
                    currentTrack.title,
                    currentTrack.poster
                  );
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

          {/* Cœur */}
          <TouchableOpacity style={styles.collapsedRight}>
            <Ionicons name="heart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ========== MODE PLEIN ECRAN ==========
  return (
    <View style={localStyles.overlayContainer}>
      <ImageBackground
        source={getPoster()}
        style={localStyles.backgroundImage}
        blurRadius={25}
        resizeMode="cover"
      >
        <View style={localStyles.overlay} />

        <View style={styles.expandedContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFullScreenPlayer(false)}
          >
            <Ionicons name="chevron-down" size={24} color="#fff" />
          </TouchableOpacity>

          <Image source={getPoster()} style={styles.albumArt} />

          <Text style={styles.expandedTrackTitle}>{currentTrack.title}</Text>
          <Text style={styles.channelName}>{currentTrack.channel}</Text>

          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={localPosition}
              onValueChange={handleValueChange}
              onSlidingComplete={handleSlidingComplete}
              minimumTrackTintColor="#1DB954"
              maximumTrackTintColor="#fff"
              thumbTintColor="#1DB954"
            />
            <View style={styles.timesRow}>
              <Text style={styles.timeText}>{formatTime(localPosition)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={cycleRepeatMode} style={{ marginRight: 20 }}>
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
                  playTrack(
                    currentTrack.id,
                    currentTrack.title,
                    currentTrack.poster
                  );
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
      </ImageBackground>
    </View>
  );
}

const localStyles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    top: -765,
    left: 0,
    width,
    height,
    zIndex: 9999,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    flex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});

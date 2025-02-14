// musicPlayers/MusicPlayerContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import TrackPlayer, {
  useProgress,
  usePlaybackState,
  State as TrackPlayerState,
} from "react-native-track-player";
import youtubeAPI from "../youtubeapi"; // Votre module de récupération des données YouTube

const MusicPlayerContext = createContext();

export const MusicPlayerProvider = ({ children }) => {
  // États du lecteur
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isRandom, setIsRandom] = useState(false);
  const [isFullScreenPlayer, setIsFullScreenPlayer] = useState(false);
  const [bottomBarHeight, setBottomBarHeight] = useState(60);

  // Hooks Track Player
  const playbackState = usePlaybackState();
  const progress = useProgress();

  // Met à jour le morceau courant lors du changement
  useEffect(() => {
    async function updateCurrentTrack() {
      const trackId = await TrackPlayer.getCurrentTrack();
      if (trackId !== null) {
        const track = await TrackPlayer.getTrack(trackId);
        setCurrentTrack(track);
      }
    }
    updateCurrentTrack();
    const listener = TrackPlayer.addEventListener("playback-track-changed", updateCurrentTrack);
    return () => listener.remove();
  }, []);

  // Fonction de lecture d’un morceau
  // L'objet track doit comporter : id, url, title, artist, artwork
  const playTrack = async (track) => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add([track]);
      await TrackPlayer.play();
    } catch (error) {
      console.error("Erreur lors de la lecture du morceau :", error);
    }
  };

  const pauseTrack = async () => {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error("Erreur lors de la pause :", error);
    }
  };

  const resumeTrack = async () => {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error("Erreur lors de la reprise :", error);
    }
  };

  const seekToPosition = async (positionMillis) => {
    try {
      // TrackPlayer.seekTo attend des secondes
      await TrackPlayer.seekTo(positionMillis / 1000);
    } catch (error) {
      console.error("Erreur lors du seek :", error);
    }
  };

  const playNextTrack = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error("Erreur lors du passage au morceau suivant :", error);
    }
  };

  const playPreviousTrack = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.error("Erreur lors du passage au morceau précédent :", error);
    }
  };

  const cycleRepeatMode = () => {
    // Exemple simple : bascule localement l’état de répétition
    // Vous pouvez également utiliser TrackPlayer.setRepeatMode si besoin
    setIsLooping(!isLooping);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying: playbackState === TrackPlayerState.Playing,
        isBusy:
          playbackState === TrackPlayerState.Buffering ||
          playbackState === TrackPlayerState.Connecting,
        // progress.position et progress.duration sont en secondes
        position: progress.position * 1000,
        duration: progress.duration * 1000,
        isLooping,
        isRandom,
        isFullScreenPlayer,
        bottomBarHeight,
        setIsFullScreenPlayer,
        setBottomBarHeight,
        playTrack,
        pauseTrack,
        resumeTrack,
        playNextTrack,
        playPreviousTrack,
        cycleRepeatMode,
        seekToPosition,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer doit être utilisé dans MusicPlayerProvider");
  }
  return context;
};

export default MusicPlayerProvider;

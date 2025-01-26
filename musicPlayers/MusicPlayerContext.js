// ===========================
// musicPlayers/MusicPlayerContext.js
// ===========================
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { View, Dimensions } from "react-native";
import { Audio } from "expo-av";
import youtubeAPI from '../youtubeapi';
import MiniPlayer from "./MiniPlayers";

const MusicPlayerContext = createContext();

export const MusicPlayerProvider = ({ children }) => {
  const audioPlayer = useRef(new Audio.Sound());

  // Configuration pour l'audio en arrière-plan
  useEffect(() => {
    const configureAudio = async () => {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      });
    };
    configureAudio();
  }, []);

  // États de lecture
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // File d'attente
  const [tracksList, setTracksList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Modes de lecture
  const [isLooping, setIsLooping] = useState(false);
  const [isRandom, setIsRandom] = useState(false);

  // Plein écran
  const [isFullScreenPlayer, setIsFullScreenPlayer] = useState(false);

  // Hauteur de la barre inférieure
  const [bottomBarHeight, setBottomBarHeight] = useState(60);

  // Récupération de l'URL audio
  const getAudioUrlWithRetries = async (trackId, maxRetries = 3) => {
    let attempt = 0;
    let bestAudio = null;
    let videoDetails = null;
    while (attempt < maxRetries && !bestAudio) {
      try {
        attempt++;
        const rawData = await youtubeAPI.player.getData(trackId, true, 'android');
        const formats = youtubeAPI.player.parseFormats(rawData);
        bestAudio = formats.filter(f => f.mimeType.includes('audio/')).sort((a, b) => b.bitrate - a.bitrate)[0];
        videoDetails = rawData.videoDetails;
      } catch (err) {
        console.log("Échec getData => tentative", attempt, err);
      }
    }
    return { bestAudio, videoDetails };
  };

  // Mise à jour de la liste
  const updateTracksList = (newTracks) => {
    if (Array.isArray(newTracks)) {
      setTracksList(newTracks);
    } else {
      setTracksList([]);
    }
    setCurrentIndex(-1);
  };

  // Lecture par index
  const playTrackByIndex = async (index) => {
    if (!tracksList[index] || isBusy) return;
    setIsBusy(true);

    try {
      const track = tracksList[index];
      if (currentTrack?.id === track.id) {
        await audioPlayer.current.playAsync();
        setIsPlaying(true);
        return;
      }

      const { bestAudio, videoDetails } = await getAudioUrlWithRetries(track.id, 5);
      if (!bestAudio?.url) return;

      await audioPlayer.current.unloadAsync();
      await audioPlayer.current.loadAsync({ uri: bestAudio.url }, {}, true);
      await audioPlayer.current.playAsync();

      setCurrentTrack({
        id: track.id,
        title: videoDetails?.title || "Titre inconnu",
        channel: videoDetails?.author || "Chaîne inconnue",
        poster: track.poster,
      });
      setCurrentIndex(index);
      setIsPlaying(true);
    } catch (err) {
      console.error("Erreur playTrackByIndex:", err);
    } finally {
      setIsBusy(false);
    }
  };

  // Lecture par ID
  const playTrack = async (trackId, trackTitle, posterUrl) => {
    if (isBusy) return;
    setIsBusy(true);

    try {
      const foundIndex = tracksList.findIndex((t) => t.id === trackId);
      if (foundIndex >= 0) {
        await playTrackByIndex(foundIndex);
      } else {
        if (currentTrack?.id === trackId) {
          await audioPlayer.current.playAsync();
          setIsPlaying(true);
          return;
        }

        const { bestAudio, videoDetails } = await getAudioUrlWithRetries(trackId, 5);
        if (!bestAudio?.url) return;

        await audioPlayer.current.unloadAsync();
        await audioPlayer.current.loadAsync({ uri: bestAudio.url }, {}, true);
        await audioPlayer.current.playAsync();

        setCurrentTrack({
          id: trackId,
          title: videoDetails?.title || trackTitle || "Titre inconnu",
          channel: videoDetails?.author || "Chaîne inconnue",
          poster: posterUrl,
        });
        setCurrentIndex(-1);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Erreur playTrack:", err);
    } finally {
      setIsBusy(false);
    }
  };

  // Pause
  const pauseTrack = async () => {
    try {
      await audioPlayer.current.pauseAsync();
      setIsPlaying(false);
    } catch (err) {
      console.error("Erreur pause:", err);
    }
  };

  // Piste suivante/précédente
  const playNextTrack = async () => {
    if (isBusy || !tracksList.length) return;
    try {
      if (isRandom) {
        await playTrackByIndex(Math.floor(Math.random() * tracksList.length));
      } else {
        const newIndex = currentIndex + 1 >= tracksList.length ? 0 : currentIndex + 1;
        await playTrackByIndex(newIndex);
      }
    } catch (err) {
      console.log("Erreur next track:", err);
    }
  };

  const playPreviousTrack = async () => {
    if (isBusy || !tracksList.length) return;
    try {
      if (isRandom) {
        await playTrackByIndex(Math.floor(Math.random() * tracksList.length));
      } else {
        const newIndex = currentIndex - 1 < 0 ? tracksList.length - 1 : currentIndex - 1;
        await playTrackByIndex(newIndex);
      }
    } catch (err) {
      console.log("Erreur previous track:", err);
    }
  };

  // Seek
  const seekToPosition = async (millis) => {
    try {
      await audioPlayer.current.setPositionAsync(millis);
    } catch (err) {
      console.error("Erreur setPositionAsync:", err);
    }
  };

  // Gestion fin de piste
  const handleEndOfTrack = async () => {
    if (isLooping) {
      currentIndex >= 0 
        ? await playTrackByIndex(currentIndex)
        : await playTrack(currentTrack.id, currentTrack.title, currentTrack.poster);
    } else {
      await playNextTrack();
    }
  };

  // Mode répétition
  const cycleRepeatMode = () => {
    if (!isLooping && !isRandom) {
      setIsLooping(true);
      setIsRandom(false);
    } else if (isLooping && !isRandom) {
      setIsLooping(false);
      setIsRandom(true);
    } else {
      setIsLooping(false);
      setIsRandom(false);
    }
  };

  // Surveillance du statut
  useEffect(() => {
    if (!audioPlayer.current) return;
    
    const subscription = audioPlayer.current.setOnPlaybackStatusUpdate(async (status) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis || 0);
        setDuration(status.durationMillis || 0);
        setIsPlaying(status.isPlaying);
        if (status.didJustFinish) await handleEndOfTrack();
      }
    });

    return () => subscription?.remove();
  }, [isLooping, isRandom, currentTrack, currentIndex]);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isBusy,
        position,
        duration,
        tracksList,
        currentIndex,
        isLooping,
        isRandom,
        updateTracksList,
        playTrackByIndex,
        playTrack,
        pauseTrack,
        playNextTrack,
        playPreviousTrack,
        cycleRepeatMode,
        seekToPosition,
        isFullScreenPlayer,
        setIsFullScreenPlayer,
        bottomBarHeight,
        setBottomBarHeight,
      }}
    >
      <View style={{ flex: 1 }}>
        {children}
        {currentTrack && (
          <View style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: bottomBarHeight,
            zIndex: 999,
          }}>
            <MiniPlayer />
          </View>
        )}
      </View>
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
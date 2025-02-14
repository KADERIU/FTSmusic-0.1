// musicPlayers/TrackPlayerService.js
import TrackPlayer, { Event } from "react-native-track-player";

module.exports = async function () {
  // Écoute de la commande Play
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  // Écoute de la commande Pause
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  // Passage au morceau suivant
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });

  // Retour au morceau précédent
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });

  // Vous pouvez ajouter d'autres écouteurs si nécessaire (RemoteSeek, RemoteStop, etc.)
};

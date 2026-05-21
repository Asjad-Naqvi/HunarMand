import React from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/theme";
import { useVideoPlayer, VideoView } from "expo-video";

export const HzSplashScreen: React.FC = () => {
  const player = useVideoPlayer(require("../../../assets/new_splash_screen_animation.mp4"), player => {
    player.loop = false;
    player.play();
  });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
        contentFit="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

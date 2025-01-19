import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";

export default function MusicCard({ title, image }) {
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#282828",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 5,
  },
  title: {
    color: "white",
    marginTop: 5,
    fontSize: 14,
    textAlign: "center",
  },
});

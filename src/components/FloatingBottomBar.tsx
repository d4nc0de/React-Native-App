import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import { IconButton, Surface } from "react-native-paper";

export default function FloatingBottomBar() {
  const navigation = useNavigation<any>();

  return (
    <Surface style={styles.bar}>
      <IconButton
        icon="home-variant-outline"
        size={26}
        onPress={() => navigation.navigate("Home")}
      />

      <IconButton
        icon="chart-line"
        size={26}
        onPress={() => {
          console.log("Go Results");
          // navigation.navigate("Results")
        }}
      />

      <IconButton
        icon="account-circle-outline"
        size={26}
        onPress={() => navigation.navigate("Profile")}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    height: 64,
    borderRadius: 32,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});

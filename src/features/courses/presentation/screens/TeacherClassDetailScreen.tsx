import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, IconButton, Menu, Surface, Text } from "react-native-paper";
import { useCourses } from "../context/CourseContext";

type Params = {
  TeacherClassDetail: { id: string };
};

export default function TeacherClassDetailScreen() {
  const route = useRoute<RouteProp<Params, "TeacherClassDetail">>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const { teacherCourses } = useCourses();

  const course = teacherCourses.find((c) => c.id === id);

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  if (!course) {
    return (
      <Surface style={styles.root}>
        <Text style={styles.error}>Class not found</Text>
      </Surface>
    );
  }

  const handleCopy = async () => {
    await Clipboard.setStringAsync(course.id);
  };

  return (
    <Surface style={styles.root}>
      <View style={styles.card}>
        {/* HEADER */}
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.subtitle}>{course.description}</Text>

        {/* CLASS CODE */}
        <View style={styles.section}>
          <Text style={styles.label}>Class code</Text>

          <View style={styles.codeBox}>
            <Text style={styles.code}>{course.id}</Text>
            <IconButton icon="content-copy" size={20} onPress={handleCopy} />
          </View>

          <Text style={styles.helper}>Share this code with your students.</Text>
        </View>

        {/* BUTTON - CATEGORIES */}
        <Button
          mode="contained"
          onPress={() => navigation.navigate("CourseCategories", { id: course.id })}
          style={styles.primaryBtn}
          buttonColor="#111"
          textColor="#fff"
        >
          Manage categories
        </Button>

        {/* DROPDOWN - SELECT CATEGORY */}
        <View style={styles.section}>
          <Text style={styles.label}>Activities by category</Text>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setMenuVisible(true)}
              >
                <Text style={{ color: selectedCategory ? "#111" : "#8A8F98" }}>
                  {selectedCategory || "Select category"}
                </Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item
              title="Category 1"
              onPress={() => {
                setSelectedCategory("Category 1");
                setMenuVisible(false);
              }}
            />
            <Menu.Item
              title="Category 2"
              onPress={() => {
                setSelectedCategory("Category 2");
                setMenuVisible(false);
              }}
            />
          </Menu>
        </View>

        {/* ACTIVITIES CARD PLACEHOLDER */}
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>Activities</Text>
          <Text style={styles.activitySmall}>Coming soon...</Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 22,
    borderRadius: 26,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    color: "#8A8F98",
    marginBottom: 18,
  },
  section: {
    marginTop: 14,
  },
  label: {
    fontSize: 14,
    color: "#8A8F98",
    marginBottom: 4,
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F1F3",
    padding: 12,
    borderRadius: 14,
    justifyContent: "space-between",
  },
  code: {
    fontFamily: "monospace",
    fontSize: 15,
    color: "#111",
  },
  helper: {
    fontSize: 12,
    color: "#8A8F98",
    marginTop: 4,
  },
  primaryBtn: {
    marginTop: 20,
    borderRadius: 14,
  },
  selectBox: {
    backgroundColor: "#F0F1F3",
    padding: 14,
    borderRadius: 12,
  },
  activityCard: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#F0F1F3",
    borderRadius: 16,
    alignItems: "center",
  },
  activityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  activitySmall: {
    fontSize: 12,
    color: "#8A8F98",
    marginTop: 4,
  },
  error: {
    color: "red",
    marginTop: 40,
    textAlign: "center",
  },
});

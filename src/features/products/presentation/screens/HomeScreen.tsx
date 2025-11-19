import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
    Avatar,
    IconButton,
    SegmentedButtons,
    Surface,
    Text,
} from "react-native-paper";

import FloatingBottomBar from "@/src/components/FloatingBottomBar";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useCourses } from "@/src/features/courses/presentation/context/CourseContext";

type Role = "student" | "teacher";

type ClassCardItem = {
  id: string;
  name?: string;
  code?: string;
  isPlus?: boolean;
};

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { studentCourses, teacherCourses, refreshCourses } = useCourses();

  const [role, setRole] = useState<Role>("student");

  useEffect(() => {
    refreshCourses();
  }, []);

  // 👇 AHORA usamos los cursos reales del contexto
  const activeCourses = role === "student" ? studentCourses : teacherCourses;

  const classes: ClassCardItem[] = useMemo(() => {
    // tomamos máximo 3 cursos para dejar el slot del "+"
    const base = activeCourses.slice(0, 3).map((c) => ({
      id: c.id,
      name: c.title,
      code: c.description,
    }));

    const list: ClassCardItem[] = [...base];

    // siempre agregamos la card "+"
    list.push({ id: "__plus__", isPlus: true });

    return list;
  }, [activeCourses]);

  const handleClassPress = (item: ClassCardItem) => {
    if (item.isPlus) {
      if (role === "student") {
        navigation.navigate("JoinClass");
      } else {
        navigation.navigate("CreateClass");
      }
    } else {
      // detalle de curso en el futuro
    }
  };

  return (
    <Surface style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Icon
            size={48}
            icon="account-circle"
            style={{ backgroundColor: "#111111" }}
          />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.userNameText}>
              {user?.name ?? user?.email ?? "Student Name"}
            </Text>
          </View>
        </View>

        <SegmentedButtons
          style={styles.segment}
          value={role}
          onValueChange={(val) => setRole(val as Role)}
          buttons={[
            { value: "student", label: "Student" },
            { value: "teacher", label: "Teacher" },
          ]}
        />
      </View>

      {/* GRID DE CLASES */}
      <View style={styles.grid}>
        {classes.map((item) => (
          <Surface
            key={item.id}
            style={[styles.card, item.isPlus && styles.plusCard]}
            onTouchEnd={() => handleClassPress(item)}
          >
            {item.isPlus ? (
              <View style={styles.plusInner}>
                <IconButton icon="plus" size={32} iconColor="#111111" />
                <Text style={styles.plusText}>
                  {role === "student" ? "Join a class" : "Create a class"}
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1, justifyContent: "space-between" }}>
                <View>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.name || "Class name"}
                  </Text>
                  {item.code ? (
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {item.code}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}
          </Surface>
        ))}
      </View>

      <FloatingBottomBar />
    </Surface>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F6F7F9",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: "#8A8F98",
  },
  userNameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },
  segment: {
    alignSelf: "flex-start",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 100,
  },
  card: {
    width: "48%",
    height: 140,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 16,
  },
  plusCard: {
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#DDDFE3",
  },
  plusInner: {
    alignItems: "center",
  },
  plusText: {
    fontSize: 13,
    color: "#111111",
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#8A8F98",
  },
});

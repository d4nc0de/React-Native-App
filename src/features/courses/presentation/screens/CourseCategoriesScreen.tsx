import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Surface,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";

import { useCourses } from "@/src/features/courses/presentation/context/CourseContext";

type RouteParams = {
  courseId: string;
  title?: string;
  maxStudents: number;
};

export default function CourseCategoriesScreen() {
  const route = useRoute<any>();
  const { courseId, title, maxStudents } = route.params as RouteParams;

  const {
    categoriesByCourse,
    loadCategories,
    createCategoryWithGroups,
    isLoading,
  } = useCourses();

  const [name, setName] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [isRandom, setIsRandom] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories(courseId);
  }, [courseId]);

  const canSubmit =
    name.trim().length > 0 && Number(groupSize) > 0 && !submitting;

  const handleCreate = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      await createCategoryWithGroups({
        courseId,
        courseMaxStudents: maxStudents,
        name: name.trim(),
        groupSize: Number(groupSize),
        isRandom,
      });
      setName("");
      setGroupSize("");
      setIsRandom(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Surface style={styles.root}>
      <Text style={styles.title}>{title || "Class"} – Categories</Text>

      {/* FORM */}
      <Card style={styles.formCard}>
        <Card.Content>
          <TextInput
            label="Category name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            label="Group size"
            value={groupSize}
            onChangeText={setGroupSize}
            keyboardType="numeric"
            style={styles.input}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Random groups</Text>
            <Switch value={isRandom} onValueChange={setIsRandom} />
          </View>

          <Button
            mode="contained"
            style={styles.submitBtn}
            disabled={!canSubmit}
            loading={submitting}
            onPress={handleCreate}
          >
            Create category & groups
          </Button>

          <Text style={styles.helper}>
            Max students in course: {maxStudents}. We will compute the number of
            groups as ⌈maxStudents / groupSize⌉.
          </Text>
        </Card.Content>
      </Card>

      {/* LISTA */}
      <Text style={styles.listTitle}>Existing categories</Text>

      <FlatList
        data={categoriesByCourse}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={!isLoading ? (
          !isLoading && (
            <Text style={styles.emptyText}>No categories yet.</Text>
          )
        ) : null}
        renderItem={({ item }) => (
          <Card style={styles.catCard}>
            <Card.Content>
              <Text style={styles.catName}>{item.name}</Text>
              <Text style={styles.catInfo}>
                Group size: {item.description || "—"} · Random:{" "}
                {item.isRandom ? "Yes" : "No"}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F6F7F9",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111111",
  },
  formCard: {
    borderRadius: 20,
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  switchLabel: {
    fontSize: 14,
  },
  submitBtn: {
    marginTop: 12,
    borderRadius: 16,
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
    color: "#8A8F98",
  },
  listTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    color: "#8A8F98",
  },
  catCard: {
    borderRadius: 16,
    marginBottom: 8,
  },
  catName: {
    fontSize: 14,
    fontWeight: "600",
  },
  catInfo: {
    fontSize: 12,
    color: "#8A8F98",
    marginTop: 2,
  },
});

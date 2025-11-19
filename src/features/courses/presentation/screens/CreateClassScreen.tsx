// src/features/courses/presentation/screens/CreateClassScreen.tsx

import React, { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from "react-native";
import { Button, Surface, Text, TextInput } from "react-native-paper";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { CreateCourseUseCase } from "@/src/features/courses/domain/usecases/CreateCourseUseCase";
import { useCourses } from "@/src/features/courses/presentation/context/CourseContext";

type Props = {
  navigation: any;
};

export default function CreateClassScreen({ navigation }: Props) {
  const { user } = useAuth();
  const di = useDI();
  const { refreshCourses } = useCourses();

  const createCourseUC = di.resolve<CreateCourseUseCase>(
    TOKENS.CreateCourseUC
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxStudents, setMaxStudents] = useState("30");
  const [loading, setLoading] = useState(false);

  const titleError = useMemo(
    () => (title.trim().length === 0 ? "Title is required" : ""),
    [title]
  );

  const maxStudentsError = useMemo(() => {
    if (!maxStudents) return "";
    const n = Number(maxStudents);
    if (Number.isNaN(n) || n <= 0) return "Must be a positive number";
    return "";
  }, [maxStudents]);

  const formValid =
    title.trim().length > 0 &&
    !titleError &&
    !maxStudentsError &&
    !!user?.id;

  const handleCreate = async () => {
    if (!formValid || !user) return;

    try {
      setLoading(true);
      await createCourseUC.execute({
        title: title.trim(),
        description: description.trim(),
        maxStudents: Number(maxStudents) || 30,
        teacherId: user.id,
      });

      await refreshCourses();
      navigation.goBack();
    } catch (e) {
      console.error("Error creating course", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Surface style={styles.root}>
        <View style={styles.card}>
          <Text style={styles.title}>Create a class</Text>
          <Text style={styles.subtitle}>
            Set up a new class for your students.
          </Text>

          <TextInput
            mode="flat"
            label="Title"
            value={title}
            onChangeText={setTitle}
            error={!!titleError}
            underlineColor="transparent"
            style={[styles.input, styles.pillWhite]}
            theme={{
              colors: {
                onSurface: "#1F1F1F",
                placeholder: "#8A8F98",
              },
            }}
          />
          {!!titleError && <Text style={styles.helper}>{titleError}</Text>}

          <TextInput
            mode="flat"
            label="Description"
            value={description}
            onChangeText={setDescription}
            underlineColor="transparent"
            multiline
            style={[styles.input, styles.pillWhite]}
            theme={{
              colors: {
                onSurface: "#1F1F1F",
                placeholder: "#8A8F98",
              },
            }}
          />

          <TextInput
            mode="flat"
            label="Max students"
            value={maxStudents}
            onChangeText={setMaxStudents}
            keyboardType="numeric"
            error={!!maxStudentsError}
            underlineColor="transparent"
            style={[styles.input, styles.pillWhite]}
            theme={{
              colors: {
                onSurface: "#1F1F1F",
                placeholder: "#8A8F98",
              },
            }}
          />
          {!!maxStudentsError && (
            <Text style={styles.helper}>{maxStudentsError}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleCreate}
            loading={loading}
            disabled={!formValid || loading}
            style={styles.primaryBtn}
            contentStyle={{ height: 52 }}
            buttonColor="#111111"
            textColor="#FFFFFF"
          >
            Create class
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 8 }}
          >
            Cancel
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    textAlign: "center",
    marginBottom: 6,
    fontWeight: "700",
    fontSize: 20,
    color: "#111111",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 18,
    color: "#8A8F98",
  },
  input: {
    marginTop: 12,
    borderRadius: 18,
  },
  pillWhite: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  helper: { color: "#d32f2f", marginTop: 4, marginLeft: 6, fontSize: 12 },
  primaryBtn: { marginTop: 20, borderRadius: 16 },
});

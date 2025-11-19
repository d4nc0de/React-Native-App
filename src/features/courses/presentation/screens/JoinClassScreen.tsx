// src/features/courses/presentation/screens/JoinClassScreen.tsx

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
import { JoinCourseUseCase } from "@/src/features/courses/domain/usecases/JoinCourseUseCase";
import { useCourses } from "@/src/features/courses/presentation/context/CourseContext";

type Props = {
  navigation: any;
};

export default function JoinClassScreen({ navigation }: Props) {
  const { user } = useAuth();
  const di = useDI();
  const { refreshCourses } = useCourses();

  const joinCourseUC = di.resolve<JoinCourseUseCase>(TOKENS.JoinCourseUC);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const codeError = useMemo(
    () => (code.trim().length === 0 ? "Class code is required" : ""),
    [code]
  );

  const formValid = code.trim().length > 0 && !codeError && !!user?.id;

  const handleJoin = async () => {
    if (!formValid || !user) return;

    try {
      setLoading(true);
      await joinCourseUC.execute({
        studentId: user.id,
        courseId: code.trim(), // este es el _id de la tabla Course
      });

      await refreshCourses();
      navigation.goBack();
    } catch (e) {
      console.error("Error joining course", e);
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
          <Text style={styles.title}>Join a class</Text>
          <Text style={styles.subtitle}>
            Enter the class code provided by your teacher.
          </Text>

          <TextInput
            mode="flat"
            label="Class code"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            underlineColor="transparent"
            error={!!codeError}
            style={[styles.input, styles.pillWhite]}
            theme={{
              colors: {
                onSurface: "#1F1F1F",
                placeholder: "#8A8F98",
              },
            }}
          />
          {!!codeError && <Text style={styles.helper}>{codeError}</Text>}

          <Button
            mode="contained"
            onPress={handleJoin}
            loading={loading}
            disabled={!formValid || loading}
            style={styles.primaryBtn}
            contentStyle={{ height: 52 }}
            buttonColor="#111111"
            textColor="#FFFFFF"
          >
            Join class
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

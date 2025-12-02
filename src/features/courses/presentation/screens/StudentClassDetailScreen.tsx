// src/features/courses/presentation/screens/StudentClassDetailScreen.tsx
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Dialog,
  Portal,
  Surface,
  Text,
} from "react-native-paper";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
// import { CourseRemoteDataSource } from "../../data/datasources/CourseRemoteDataSource";
import { CourseRemoteDataSource } from "../../domain/data/datasources/CourseRemoteDataSource";
import { Category } from "../../domain/entities/Category";
import { useCourses } from "../context/CourseContext";

type Params = {
  StudentClassDetail: { id: string };
};

type UiGroup = {
  id: string;
  name: string;
  number: number;
  members: number;
  isRandomGroup: boolean;
};

export default function StudentClassDetailScreen() {
  const route = useRoute<RouteProp<Params, "StudentClassDetail">>();
  const navigation = useNavigation<any>();
  const { id: courseId } = route.params;

  const { user } = useAuth();
  const { studentCourses, categoriesByCourse, loadCategories } = useCourses();

  const di = useDI();
  const courseDS = di.resolve<CourseRemoteDataSource>(TOKENS.CourseRemoteDS);

  const course = studentCourses.find((c) => c.id === courseId) || null;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [groups, setGroups] = useState<UiGroup[]>([]);
  const [myGroupId, setMyGroupId] = useState<string | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [changingGroup, setChangingGroup] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [groupPickerVisible, setGroupPickerVisible] = useState(false);


  // Cargar categorías del curso
  useEffect(() => {
    if (!courseId) return;
    loadCategories(courseId);
  }, [courseId, loadCategories]);


  useEffect(() => {
    const first = categoriesByCourse[0];
    if (first && !selectedCategoryId) {
      handleSelectCategory(first.id);
    }
  }, [categoriesByCourse, selectedCategoryId]);


  if (!course) {
    return (
      <Surface style={styles.root}>
        <Text style={styles.error}>Class not found</Text>
      </Surface>
    );
  }

  const selectedCategory: Category | undefined = categoriesByCourse.find(
    (c) => c.id === selectedCategoryId
  );

  const groupSize = selectedCategory
    ? Number(selectedCategory.description || 0)
    : 0;

  const isRandomCategory = !!selectedCategory?.isRandom;

  const handleSelectCategory = async (categoryId: string) => {
    if (!user) return;

    setSelectedCategoryId(categoryId);
    setLoadingGroups(true);

    try {

      const apiGroups = await courseDS.getGroupsByCategory(categoryId);
      setGroups(apiGroups);


      const myGroup = await courseDS.getStudentActiveGroupForCategory(
        user.id,
        categoryId
      );
      setMyGroupId(myGroup);
      setErrorMsg(null);
    } catch (e) {
      console.error("Error loading groups", e);
      setErrorMsg((e as Error).message);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleChangeGroup = async (group: UiGroup) => {
    if (!user || !selectedCategoryId || isRandomCategory) return;
    if (!groupSize) {
      setErrorMsg("This category has no valid group size");
      return;
    }
    if (group.members >= groupSize) {
      setErrorMsg("This group is already full");
      return;
    }

    try {
      setChangingGroup(true);
      await courseDS.changeGroupManual({
        studentId: user.id,
        categoryId: selectedCategoryId,
        newGroupId: group.id,
        groupSize,
      });

      // recargar estado de la categoría
      await handleSelectCategory(selectedCategoryId);
      setGroupPickerVisible(false);
    } catch (e) {
      console.error("changeGroup error", e);
      setErrorMsg((e as Error).message);
    } finally {
      setChangingGroup(false);
    }
  };


  const renderGroupsSection = () => {
    if (!selectedCategory) {
      return (
        <Text style={styles.helper}>
          Select a category to see its groups.
        </Text>
      );
    }

    if (loadingGroups) {
      return (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }

    if (groups.length === 0) {
      return (
        <Text style={styles.helper}>This category has no groups yet.</Text>
      );
    }

    const myGroup = groups.find((g) => g.id === myGroupId);

    if (isRandomCategory) {
      return (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionCaption}>
            Random groups (automatically assigned)
          </Text>
          {myGroup ? (
            <Surface
              style={[
                styles.groupCard,
                { borderLeftColor: "#22c55e", borderLeftWidth: 3 },
              ]}
            >
              <Text style={styles.groupTitle}>{myGroup.name}</Text>
              <Text style={styles.groupMembers}>
                {myGroup.members}/{groupSize} members
              </Text>
              <Text style={styles.groupTag}>You belong to this group</Text>
            </Surface>
          ) : (
            <Text style={styles.helper}>
              You are not assigned to any group in this category yet.
            </Text>
          )}
        </View>
      );
    }

    const hasAnySpace =
      groupSize > 0 &&
      groups.some((g) => g.members < groupSize || g.id === myGroupId);

    return (
      <View style={{ marginTop: 12 }}>
        <Text style={styles.sectionCaption}>
          Manual groups (you can choose one)
        </Text>

        {myGroup ? (
          <Surface style={styles.groupCard}>
            <Text style={styles.groupTitle}>{myGroup.name}</Text>
            <Text style={styles.groupMembers}>
              {myGroup.members}/{groupSize} members
            </Text>
            <Text style={styles.groupTag}>✓ You belong to this group</Text>
          </Surface>
        ) : (
          <Text style={styles.helper}>
            You are not assigned to any group in this category yet.
          </Text>
        )}

        {hasAnySpace && (
          <Button
            mode="contained"
            style={{ marginTop: 12, borderRadius: 12 }}
            buttonColor="#111"
            loading={changingGroup}
            onPress={() => setGroupPickerVisible(true)}
          >
            {myGroupId ? "Change group" : "Join group"}
          </Button>
        )}
      </View>
    );
  };

  const availableGroupsForPicker = groups; 


  return (
    <Surface style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.subtitle}>{course.description}</Text>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Category</Text>

            <View style={styles.selectBox}>
              <Text
                style={{
                  color: selectedCategory ? "#111" : "#8A8F98",
                }}
              >
                {selectedCategory?.name || "Select category"}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              {categoriesByCourse.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.categoryChip,
                    c.id === selectedCategoryId && styles.categoryChipActive,
                  ]}
                  onPress={() => handleSelectCategory(c.id)}
                >
                  <Text
                    style={{
                      color: c.id === selectedCategoryId ? "#fff" : "#111",
                      fontSize: 12,
                    }}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {renderGroupsSection()}

          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionCaption}>Activities</Text>
            <Surface style={styles.activityCard}>
              <Text style={styles.activityTitle}>No activities yet</Text>
              <Text style={styles.activitySubtitle}>Coming soon…</Text>
            </Surface>
          </View>

          {errorMsg && (
            <Text style={{ color: "red", marginTop: 12 }}>{errorMsg}</Text>
          )}
        </View>
      </ScrollView>
      <Portal>
        <Dialog
          visible={groupPickerVisible && !isRandomCategory}
          onDismiss={() => setGroupPickerVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Select group</Dialog.Title>

          <Dialog.Content style={styles.dialogContent}>
            <ScrollView
              style={styles.dialogScroll}
              contentContainerStyle={styles.dialogScrollContent}
              showsVerticalScrollIndicator
            >
              {availableGroupsForPicker.map((g) => {
                const isMine = g.id === myGroupId;
                const isFull = groupSize > 0 && g.members >= groupSize;
                const disabled = isFull && !isMine;

                return (
                  <TouchableOpacity
                    key={g.id}
                    disabled={disabled || changingGroup}
                    onPress={() => handleChangeGroup(g)}
                    style={[
                      styles.dialogGroupRow,
                      isMine && styles.dialogGroupRowActive,
                      disabled && styles.dialogGroupRowDisabled,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dialogGroupName}>{g.name}</Text>
                      <Text style={styles.dialogGroupMembers}>
                        {g.members}/{groupSize} members
                      </Text>
                    </View>

                    {isMine && (
                      <Text style={styles.dialogChipCurrent}>You</Text>
                    )}
                    {isFull && !isMine && (
                      <Text style={styles.dialogChipFull}>Full</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() => setGroupPickerVisible(false)}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#8A8F98",
    marginBottom: 4,
  },
  selectBox: {
    backgroundColor: "#F0F1F3",
    padding: 14,
    borderRadius: 12,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    marginRight: 6,
    marginBottom: 6,
  },
  categoryChipActive: {
    backgroundColor: "#111",
  },
  sectionCaption: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 4,
  },
  helper: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
  },
  groupCard: {
    marginTop: 8,
    padding: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  groupMembers: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  groupTag: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 4,
  },
  activityCard: {
    marginTop: 8,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  error: {
    color: "red",
    marginTop: 40,
    textAlign: "center",
  },
  dialog: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  dialogContent: {
    paddingTop: 0,
  },
  dialogScroll: {
    maxHeight: 260,
  },
  dialogScrollContent: {
    paddingVertical: 4,
  },
  dialogGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  dialogGroupRowActive: {
    backgroundColor: "#F3F4FF",
  },
  dialogGroupRowDisabled: {
    opacity: 0.4,
  },
  dialogGroupName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  dialogGroupMembers: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  dialogChipCurrent: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
    color: "#16A34A",
    marginLeft: 8,
  },
  dialogChipFull: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    marginLeft: 8,
  },
});

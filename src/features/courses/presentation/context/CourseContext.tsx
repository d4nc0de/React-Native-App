// src/features/courses/presentation/context/CourseContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";

import { Course } from "@/src/features/courses/domain/entities/Course";
import { GetStudentCoursesUseCase } from "@/src/features/courses/domain/usecases/GetStudentCoursesUseCase";
import { GetTeacherCoursesUseCase } from "@/src/features/courses/domain/usecases/GetTeacherCoursesUseCase";

type CourseContextType = {
  studentCourses: Course[];
  teacherCourses: Course[];
  isLoading: boolean;
  error: string | null;
  refreshCourses: () => Promise<void>;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const di = useDI();
  const { user } = useAuth();

  const getStudentCoursesUC = di.resolve<GetStudentCoursesUseCase>(
    TOKENS.GetStudentCoursesUC
  );
  const getTeacherCoursesUC = di.resolve<GetTeacherCoursesUseCase>(
    TOKENS.GetTeacherCoursesUC
  );

  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCourses = async () => {
    if (!user) {
      setStudentCourses([]);
      setTeacherCourses([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [asStudent, asTeacher] = await Promise.all([
        getStudentCoursesUC.execute(user.id),
        getTeacherCoursesUC.execute(user.id),
      ]);

      setStudentCourses(asStudent);
      setTeacherCourses(asTeacher);
    } catch (e) {
      console.error("Error loading courses", e);
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCourses();
    } else {
      setStudentCourses([]);
      setTeacherCourses([]);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      studentCourses,
      teacherCourses,
      isLoading,
      error,
      refreshCourses,
    }),
    [studentCourses, teacherCourses, isLoading, error]
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used inside CourseProvider");
  return ctx;
}

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

import { Category } from "@/src/features/courses/domain/entities/Category";
import { Course } from "@/src/features/courses/domain/entities/Course";

import { CreateCategoryWithGroupsUseCase } from "@/src/features/courses/domain/usecases/CreateCategoryWithGroupsUseCase";
import { GetCategoriesByCourseUseCase } from "@/src/features/courses/domain/usecases/GetCategoriesByCourseUseCase";
import { GetStudentCoursesUseCase } from "@/src/features/courses/domain/usecases/GetStudentCoursesUseCase";
import { GetTeacherCoursesUseCase } from "@/src/features/courses/domain/usecases/GetTeacherCoursesUseCase";

type CourseContextType = {
  studentCourses: Course[];
  teacherCourses: Course[];
  isLoading: boolean;
  error: string | null;
  refreshCourses: () => Promise<void>;

  // categorías del curso que esté viendo el profe
  categoriesByCourse: Category[];
  loadCategories: (courseId: string) => Promise<void>;

  // crear categoría + grupos
  createCategoryWithGroups: (params: {
    courseId: string;
    courseMaxStudents: number;
    name: string;
    groupSize: number;
    isRandom: boolean;
  }) => Promise<void>;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const di = useDI();
  const { user } = useAuth();

  const getStudentCoursesUC = di.resolve<GetStudentCoursesUseCase>(
    TOKENS.GetStudentCoursesUC
  );
  const getTeacherCoursesUC = di.resolve<GetTeacherCoursesUseCase>(
    TOKENS.GetTeacherCoursesUC
  );
  const getCategoriesUC = di.resolve<GetCategoriesByCourseUseCase>(
    TOKENS.GetCategoriesByCourseUC
  );
  const createCategoryWithGroupsUC =
    di.resolve<CreateCategoryWithGroupsUseCase>(
      TOKENS.CreateCategoryWithGroupsUC
    );

  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [categoriesByCourse, setCategoriesByCourse] = useState<Category[]>([]);
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

  const loadCategories = async (courseId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const cats = await getCategoriesUC.execute(courseId);
      setCategoriesByCourse(cats);
    } catch (e) {
      console.error("Error loading categories", e);
      setError((e as Error).message);
      setCategoriesByCourse([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createCategoryWithGroups = async (params: {
    courseId: string;
    courseMaxStudents: number;
    name: string;
    groupSize: number;
    isRandom: boolean;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      await createCategoryWithGroupsUC.execute(params);

      // recargar categorías del curso
      await loadCategories(params.courseId);
    } catch (e) {
      console.error("Error creating category with groups", e);
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
      setCategoriesByCourse([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const value = useMemo(
    () => ({
      studentCourses,
      teacherCourses,
      isLoading,
      error,
      refreshCourses,
      categoriesByCourse,
      loadCategories,
      createCategoryWithGroups,
    }),
    [
      studentCourses,
      teacherCourses,
      isLoading,
      error,
      categoriesByCourse,
      loadCategories,
      createCategoryWithGroups,
    ]
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};

// 👇 ESTE es el hook que quieres importar
export const useCourses = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used inside CourseProvider");
  return ctx;
};

// opcional: export default por si usas <CourseProvider /> sin llaves
export default CourseProvider;

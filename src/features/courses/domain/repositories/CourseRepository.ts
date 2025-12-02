import { Category } from "../entities/Category";
import { Course } from "../entities/Course";

export interface CourseRepository {
  getStudentCourses(userId: string): Promise<Course[]>;
  getTeacherCourses(userId: string): Promise<Course[]>;
  createCourse(data: {
    title: string;
    description: string;
    maxStudents: number;
    teacherId: string;
  }): Promise<void>;

  joinCourse(data: {
    studentId: string;
    courseId: string;
  }): Promise<void>;

  getCategoriesByCourse(courseId: string): Promise<Category[]>;

  createCategoryWithGroups(params: {
    courseId: string;
    courseMaxStudents: number;
    name: string;
    groupSize: number;
    isRamdom: boolean;
  }): Promise<void>;
}

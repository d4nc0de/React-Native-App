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
}

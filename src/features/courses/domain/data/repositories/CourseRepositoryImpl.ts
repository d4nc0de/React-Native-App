import { Category } from "../../entities/Category";
import { Course } from "../../entities/Course";
import { CourseRepository } from "../../repositories/CourseRepository";
import { CourseRemoteDataSource } from "../datasources/CourseRemoteDataSource";

export class CourseRepositoryImpl implements CourseRepository {
  constructor(private remote: CourseRemoteDataSource) {}

  getStudentCourses(userId: string): Promise<Course[]> {
    return this.remote.getStudentCourses(userId);
  }

  getTeacherCourses(userId: string): Promise<Course[]> {
    return this.remote.getTeacherCourses(userId);
  }
  
  async createCourse(data: {
    title: string;
    description: string;
    maxStudents: number;
    teacherId: string;
  }): Promise<void> {
    return this.remote.createCourse(data);
  }
  
  async joinCourse(data: {
    studentId: string;
    courseId: string;
  }): Promise<void> {
    return this.remote.joinCourse(data);
  }
  
  getCategoriesByCourse(courseId: string): Promise<Category[]> {
    return this.remote.getCategoriesByCourse(courseId);
  }

  createCategoryWithGroups(params: {
    courseId: string;
    courseMaxStudents: number;
    name: string;
    groupSize: number;
    isRamdom: boolean;
  }): Promise<void> {
    return this.remote.createCategoryWithGroups(params);
  }
}

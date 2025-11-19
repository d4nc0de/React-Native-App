import { CourseRepository } from "../repositories/CourseRepository";

export class GetTeacherCoursesUseCase {
  constructor(private repo: CourseRepository) {}

  execute(userId: string) {
    return this.repo.getTeacherCourses(userId);
  }
}
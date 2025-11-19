import { CourseRepository } from "../repositories/CourseRepository";

export class GetStudentCoursesUseCase {
    constructor(private repo: CourseRepository) {}
  
    async execute(userId: string) {
      return this.repo.getStudentCourses(userId);
    }
  }
  
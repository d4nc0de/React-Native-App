import { CourseRepository } from "../repositories/CourseRepository";

export class JoinCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(data: {
    studentId: string;
    courseId: string;
  }) {
    return this.repo.joinCourse(data);
  }
}

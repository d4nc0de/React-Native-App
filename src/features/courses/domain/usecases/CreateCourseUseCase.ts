import { CourseRepository } from "../repositories/CourseRepository";

export class CreateCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(data: {
    title: string;
    description: string;
    maxStudents: number;
    teacherId: string;
  }) {
    return this.repo.createCourse(data);
  }
}

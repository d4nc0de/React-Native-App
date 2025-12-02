import { Category } from "../entities/Category";
import { CourseRepository } from "../repositories/CourseRepository";

export class GetCategoriesByCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(courseId: string): Promise<Category[]> {
    return this.repo.getCategoriesByCourse(courseId);
  }
}

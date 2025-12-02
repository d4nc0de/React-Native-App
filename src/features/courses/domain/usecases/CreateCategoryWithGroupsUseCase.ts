import { CourseRepository } from "../repositories/CourseRepository";

export class CreateCategoryWithGroupsUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(params: {
    courseId: string;
    courseMaxStudents: number;
    name: string;
    groupSize: number;
    isRandom: boolean;
  }): Promise<void> {
    return this.repo.createCategoryWithGroups(params);
  }
}

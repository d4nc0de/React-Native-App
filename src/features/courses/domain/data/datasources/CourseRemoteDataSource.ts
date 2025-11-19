import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { Course } from "../../entities/Course";

export class CourseRemoteDataSource {
  private baseUrl: string;
  private prefs: ILocalPreferences;

  constructor(private projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) throw new Error("Missing project id");
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  private async fetchAuth(url: string, params: Record<string, any>) {
    const token = await this.prefs.retrieveData("token");

    const query = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${query}`;

    const res = await fetch(fullUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  }

  async getTeacherCourses(teacherId: string): Promise<Course[]> {
    const data = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Course",
      teacher_id: teacherId, // filtro exacto
    });

    return data.map((c: any) => ({
      id: c._id,
      title: c.Titulo,
      description: c.Description,
      teacherId: c.teacher_id,
      maxStudents: Number(c.Max_students),
    }));
  }

  async getStudentCourses(studentId: string): Promise<Course[]> {
    // 1. fetch relations
    const relations = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Rel_Curso_Estudiante",
      Estudiante_Id: studentId,
    });

    const courseIds = relations.map((r: any) => r.Curso_Id);

    const courses: Course[] = [];

    for (const id of courseIds) {
      const result = await this.fetchAuth(`${this.baseUrl}/read`, {
        tableName: "Course",
        _id: id,
      });

      if (result.length > 0) {
        const c = result[0];
        courses.push({
          id: c._id,
          title: c.Titulo,
          description: c.Description,
          teacherId: c.teacher_id,
          maxStudents: Number(c.Max_students),
        });
      }
    }

    return courses;
  }

  async createCourse(data: {
    title: string;
    description: string;
    maxStudents: number;
    teacherId: string;
  }): Promise<void> {
    const token = await this.prefs.retrieveData("token");
  
    const res = await fetch(`${this.baseUrl}/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tableName: "Course",
        records: [
          {
            Titulo: data.title,
            Description: data.description,
            Max_students: data.maxStudents,
            teacher_id: data.teacherId,
          },
        ],
      }),
    });
  
    if (!res.ok) throw new Error("Error creating course");
  }
    
  async joinCourse(data: {
    studentId: string;
    courseId: string;
  }): Promise<void> {
    const token = await this.prefs.retrieveData("token");
  
    const today = new Date().toISOString().split("T")[0];
  
    const res = await fetch(`${this.baseUrl}/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tableName: "Rel_Curso_Estudiante",
        records: [
          {
            Estudiante_Id: data.studentId,
            Curso_Id: data.courseId,
            Estado: "ACT",
            Fecha_Ingreso: today,
          },
        ],
      }),
    });
  
    if (!res.ok) throw new Error("Error joining course");
  }
  
}

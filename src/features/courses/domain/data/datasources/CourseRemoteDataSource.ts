// src/features/courses/data/datasources/CourseRemoteDataSource.ts
import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { Category } from "../../entities/Category";
import { Course } from "../../entities/Course";


export class CourseRemoteDataSource {
  private baseUrl: string;
  private prefs: ILocalPreferences;

  constructor(private projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) throw new Error("Missing project id");
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }


  private async getToken() {
    const token = await this.prefs.retrieveData("token");
    if (!token) throw new Error("No auth token");
    return token as string;
  }

  private buildQuery(params: Record<string, any>): string {
    const clean: Record<string, string> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      clean[k] = String(v);
    });
    return new URLSearchParams(clean).toString();
  }

  private async fetchAuth(
    url: string,
    params: Record<string, any>
  ): Promise<any> {
    const token = await this.getToken();
    const query = this.buildQuery(params);
    const fullUrl = `${url}?${query}`;

    const res = await fetch(fullUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  }

  private async postAuth(path: string, body: any): Promise<any> {
    const token = await this.getToken();
    const res = await fetch(`${this.baseUrl}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Error ${res.status}: ${txt}`);
    }

    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  private async putAuth(path: string, body: any): Promise<any> {
    const token = await this.getToken();
    const res = await fetch(`${this.baseUrl}/${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Error ${res.status}: ${txt}`);
    }

    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  private async deleteAuth(path: string, body: any): Promise<any> {
    const token = await this.getToken();
    const res = await fetch(`${this.baseUrl}/${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Error ${res.status}: ${txt}`);
    }

    try {
      return await res.json();
    } catch {
      return null;
    }
  }


  async getTeacherCourses(teacherId: string): Promise<Course[]> {
    const data = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Course",
      teacher_id: teacherId,
    });

    return (data as any[]).map((c) => ({
      id: c._id,
      title: c.Titulo,
      description: c.Description,
      teacherId: c.teacher_id,
      maxStudents: Number(c.Max_students),
    }));
  }

  async getStudentCourses(studentId: string): Promise<Course[]> {
    const relations = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Rel_Curso_Estudiante",
      Estudiante_Id: studentId,
      Estado: "ACT",
    });

    const courseIds: string[] = relations.map((r: any) => r.Curso_Id);

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
    await this.postAuth("insert", {
      tableName: "Course",
      records: [
        {
          Titulo: data.title,
          Description: data.description,
          Max_students: data.maxStudents,
          teacher_id: data.teacherId,
        },
      ],
    });
  }

  async joinCourse(data: {
    studentId: string;
    courseId: string;
  }): Promise<void> {
    const today = new Date().toISOString().split("T")[0];


    await this.postAuth("insert", {
      tableName: "Rel_Curso_Estudiante",
      records: [
        {
          Estudiante_Id: data.studentId,
          Curso_Id: data.courseId,
          Estado: "ACT",
          Fecha_Ingreso: today,
        },
      ],
    });


    try {
      await this.assignStudentToRandomGroups(data.studentId, data.courseId);
    } catch (e) {
      console.error("Error assigning student to random groups", e);
    }
  }


  private async assignStudentToRandomGroups(
    studentId: string,
    courseId: string
  ): Promise<void> {

    const randomCategories = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Categories",
      Curso_id: courseId,
      IsRamdom: true, 
    });

    if (!randomCategories || randomCategories.length === 0) return;

    for (const cat of randomCategories) {
      const categoryId = cat._id as string;
      const groupSize = Number(cat.Description); 

      if (!groupSize || isNaN(groupSize) || groupSize <= 0) continue;


      const groups = await this.fetchAuth(`${this.baseUrl}/read`, {
        tableName: "Group",
        categorie_Id: categoryId,
      });

      if (!groups || groups.length === 0) continue;


      const groupsWithSpace = groups.filter((g: any) => {
        const members = Number(g.members ?? 0);
        return members < groupSize;
      });

      if (groupsWithSpace.length === 0) continue;


      const randomIndex = Math.floor(
        Math.random() * groupsWithSpace.length
      );
      const chosen = groupsWithSpace[randomIndex];

      const currentMembers = Number(chosen.members ?? 0);
      const newMembers = currentMembers + 1;

      await this.putAuth("update", {
        tableName: "Group",
        idColumn: "_id",
        idValue: chosen._id,
        updates: {
          members: newMembers,
        },
      });

      await this.postAuth("insert", {
        tableName: "Rel_Estudiante_Grupo",
        records: [
          {
            Estudiante_Id: studentId,
            Grupo_Id: chosen._id,
            Estado: "ACT",
          },
        ],
      });
    }
  }


  async getCategoriesByCourse(courseId: string): Promise<Category[]> {
    const data = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Categories",
      Curso_id: courseId,
    });

    return (data as any[]).map((c) => ({
      id: c._id,
      name: c.Name,
      description: c.Description,
      isRandom: !!c.IsRamdom,
      courseId: c.Curso_id,
    }));
  }

  async createCategoryWithGroups(params: {
    courseId: string;
    courseMaxStudents: number;
    name: string;
    groupSize: number;
    isRandom: boolean;   
  }): Promise<void> {
    const { courseId, courseMaxStudents, name, groupSize, isRandom } = params;
  
    const randomFlag  = !!isRandom; 
  
    if (!groupSize || groupSize <= 0) {
      throw new Error("groupSize must be > 0");
    }
  
    // 1) Crear categoría
    const categoryInsertResult = await this.postAuth("insert", {
      tableName: "Categories",
      records: [
        {
          Name: name,
          Description: String(groupSize), 
          IsRamdom: randomFlag,            
          Curso_id: courseId,
        },
      ],
    });
  
    const insertedCategories: any[] =
      categoryInsertResult?.inserted ?? categoryInsertResult ?? [];
  
    if (!insertedCategories.length) {
      throw new Error("Category insert did not return id");
    }
  
    const categoryId = insertedCategories[0]._id || insertedCategories[0].id;
  
    const numberOfGroups = Math.ceil(courseMaxStudents / groupSize);
    if (!numberOfGroups || !isFinite(numberOfGroups)) {
      throw new Error("Invalid number of groups");
    }
  
  
    const groupRecords = Array.from({ length: numberOfGroups }).map((_, idx) => ({
      categorie_Id: categoryId,
      number: idx + 1,
      IsRamdonGroup: randomFlag,    
      members: 0,                   
    }));
  
    const groupInsertResult = await this.postAuth("insert", {
      tableName: "Group",
      records: groupRecords,
    });
  
    const insertedGroups: any[] =
      groupInsertResult?.inserted ?? groupInsertResult ?? [];
  
    if (!insertedGroups.length) {
      throw new Error("Groups insert failed");
    }
  
    //Si la categoría NO es random, aquí termina: solo crea los grupos
    if (!isRandom) return;
  
    // Obtener estudiantes del curso (para categorías random)
    const relations = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Rel_Curso_Estudiante",
      Curso_Id: courseId,
      Estado: "ACT",
    });
  
    const studentIds: string[] = relations.map((r: any) => r.Estudiante_Id);
    if (!studentIds.length) return;
  
    const groupIds: string[] = insertedGroups.map((g: any) => g._id || g.id);

    const shuffled = [...studentIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  
    const membersCount: Record<string, number> = {};
    groupIds.forEach((id) => (membersCount[id] = 0));
  
    const relRecords = shuffled.map((studentId, idx) => {
      const groupIndex = idx % groupIds.length;
      const groupId = groupIds[groupIndex];
  
      membersCount[groupId] = (membersCount[groupId] ?? 0) + 1;
  
      return {
        Estudiante_Id: studentId,
        Grupo_Id: groupId,
        Estado: "ACT",
      };
    });
  
    await this.postAuth("insert", {
      tableName: "Rel_Estudiante_Grupo",
      records: relRecords,
    });
  
    for (const groupId of groupIds) {
      await this.putAuth("update", {
        tableName: "Group",
        idColumn: "_id",
        idValue: groupId,
        updates: {
          members: membersCount[groupId] ?? 0,
        },
      });
    }
  }
  

  async getStudentGroupInCategory(
    studentId: string,
    categoryId: string
  ): Promise<any | null> {
    // 1) obtener grupos de la categoría
    const groups = await this.getGroupsByCategory(categoryId);
    const groupIds = groups.map((g: any) => g._id);

    if (!groupIds.length) return null;

    // 2) buscar relación estudiante-grupo
    const relations = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Rel_Estudiante_Grupo",
      Estudiante_Id: studentId,
      Estado: "ACT",
    });

    const groupIdSet = new Set(groupIds);
    const rel = relations.find((r: any) => groupIdSet.has(r.Grupo_Id));
    if (!rel) return null;

    return groups.find((g: any) => g._id === rel.Grupo_Id) ?? null;
  }

  private async getGroupById(groupId: string): Promise<any | null> {
    const data = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Group",
      _id: groupId,
    });
    if (!data || data.length === 0) return null;
    return data[0];
  }

  async leaveGroup(studentId: string, groupId: string): Promise<void> {
    // eliminar relación
    await this.deleteAuth("delete", {
      tableName: "Rel_Estudiante_Grupo",
      conditions: {
        Estudiante_Id: studentId,
        Grupo_Id: groupId,
      },
    });

    // decrementar contador
    const group = await this.getGroupById(groupId);
    if (!group) return;

    const currentMembers = Number(group.members ?? 0);
    const newMembers = Math.max(0, currentMembers - 1);

    await this.putAuth("update", {
      tableName: "Group",
      idColumn: "_id",
      idValue: groupId,
      updates: {
        members: newMembers,
      },
    });
  }


  async joinGroup(
    studentId: string,
    groupId: string,
    previousGroupId?: string
  ): Promise<void> {
    if (previousGroupId && previousGroupId !== groupId) {
      await this.leaveGroup(studentId, previousGroupId);
    }

    // crear relación
    await this.postAuth("insert", {
      tableName: "Rel_Estudiante_Grupo",
      records: [
        {
          Estudiante_Id: studentId,
          Grupo_Id: groupId,
          Estado: "ACT",
        },
      ],
    });

    // incrementar contador
    const group = await this.getGroupById(groupId);
    if (!group) return;

    const currentMembers = Number(group.members ?? 0);
    const newMembers = currentMembers + 1;

    await this.putAuth("update", {
      tableName: "Group",
      idColumn: "_id",
      idValue: groupId,
      updates: {
        members: newMembers,
      },
    });
  }

  async getGroupsByCategory(categoryId: string): Promise<
    {
      id: string;
      name: string;
      number: number;
      members: number;
      isRandomGroup: boolean;
    }[]
  > {
    const data = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Group",
      categorie_Id: categoryId,
    });

    return (data as any[]).map((g) => ({
      id: g._id,
      name: g.name,
      number: Number(g.number),
      members: Number(g.members ?? 0),
      isRandomGroup: !!g.IsRamdonGroup,
    }));
  }

  async getStudentActiveGroupForCategory(
    studentId: string,
    categoryId: string
  ): Promise<string | null> {
    // grupos de la categoría
    const groups = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Group",
      categorie_Id: categoryId,
    });
    const groupIds = new Set<string>((groups as any[]).map((g) => g._id));

    if (groupIds.size === 0) return null;

    //relaciones del estudiante
    const relations = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Rel_Estudiante_Grupo",
      Estudiante_Id: studentId,
      Estado: "ACT",
    });

    const relForCategory = (relations as any[]).find((r) =>
      groupIds.has(r.Grupo_Id)
    );

    return relForCategory ? (relForCategory.Grupo_Id as string) : null;
  }

  async changeGroupManual(params: {
    studentId: string;
    categoryId: string;
    newGroupId: string;
    groupSize: number;
  }): Promise<void> {
    const { studentId, categoryId, newGroupId, groupSize } = params;
    const token = await this.getToken();

    if (!groupSize || groupSize <= 0) {
      throw new Error("Invalid group size");
    }

    // obtener grupos de la categoría
    const groups = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Group",
      categorie_Id: categoryId,
    });

    const groupsArr = groups as any[];
    const groupIdsSet = new Set<string>(groupsArr.map((g) => g._id));

    const newGroup = groupsArr.find((g) => g._id === newGroupId);
    if (!newGroup) throw new Error("Group not found");

    const newGroupMembers = Number(newGroup.members ?? 0);
    if (newGroupMembers >= groupSize) {
      throw new Error("Group is full");
    }

    // relaciones activas del estudiante
    const relations = await this.fetchAuth(`${this.baseUrl}/read`, {
      tableName: "Rel_Estudiante_Grupo",
      Estudiante_Id: studentId,
      Estado: "ACT",
    });

    const currentRel = (relations as any[]).find((r) =>
      groupIdsSet.has(r.Grupo_Id)
    );

    // Si ya está en ese grupo, no hacemos nada
    if (currentRel && currentRel.Grupo_Id === newGroupId) {
      return;
    }

    // si estaba en otro grupo de la misma categoría => lo sacamos
    if (currentRel) {
      const oldGroupId = currentRel.Grupo_Id as string;
      const oldGroup = groupsArr.find((g) => g._id === oldGroupId);

      // borrar relación
      await fetch(`${this.baseUrl}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableName: "Rel_Estudiante_Grupo",
          idColumn: "_id",
          idValue: currentRel._id, 
        }),
      });

      // decrementar contador de miembros del grupo anterior
      if (oldGroup) {
        const newCount = Math.max(0, Number(oldGroup.members ?? 0) - 1);
        await fetch(`${this.baseUrl}/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tableName: "Group",
            idColumn: "_id",
            idValue: oldGroupId,
            updates: { members: newCount },
          }),
        });
      }
    }

    // insertar nueva relación
    await fetch(`${this.baseUrl}/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tableName: "Rel_Estudiante_Grupo",
        records: [
          {
            Estudiante_Id: studentId,
            Grupo_Id: newGroupId,
            Estado: "ACT",
          },
        ],
      }),
    });

    // actualizar contador de miembros del nuevo grupo
    await fetch(`${this.baseUrl}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tableName: "Group",
        idColumn: "_id",
        idValue: newGroupId,
        updates: { members: newGroupMembers + 1 },
      }),
    });
  }
}

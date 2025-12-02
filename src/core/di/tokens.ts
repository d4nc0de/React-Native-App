export const TOKENS = {
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  LoginUC: Symbol("LoginUC"),
  SignupUC: Symbol("SignupUC"),
  LogoutUC: Symbol("LogoutUC"),
  GetCurrentUserUC: Symbol("GetCurrentUserUC"),

  // Products
  ProductRemoteDS: Symbol("ProductRemoteDS"),
  ProductRepo: Symbol("ProductRepo"),
  AddProductUC: Symbol("AddProductUC"),
  UpdateProductUC: Symbol("UpdateProductUC"),
  DeleteProductUC: Symbol("DeleteProductUC"),
  GetProductsUC: Symbol("GetProductsUC"),
  GetProductByIdUC: Symbol("GetProductByIdUC"),

  // ⭐ NEW: Courses
  CourseRemoteDS: Symbol("CourseRemoteDS"),
  CourseRepo: Symbol("CourseRepo"),
  GetStudentCoursesUC: Symbol("GetStudentCoursesUC"),
  GetTeacherCoursesUC: Symbol("GetTeacherCoursesUC"),
  CreateCourseUC: Symbol("CreateCourseUC"),
  JoinCourseUC: Symbol("JoinCourseUC"),

  GetCategoriesByCourseUC: Symbol("GetCategoriesByCourseUC"),
  CreateCategoryWithGroupsUC: Symbol("CreateCategoryWithGroupsUC"),
} as const;

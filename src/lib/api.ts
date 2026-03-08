const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "same-origin",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    classCode?: string;
    gradeLevel?: string;
  }) =>
    request<{ user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  getMe: () => request<{ user: any }>("/auth/me"),

  // Writings
  getWritings: (params?: {
    student_id?: string;
    class_code?: string;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.student_id) qs.set("student_id", params.student_id);
    if (params?.class_code) qs.set("class_code", params.class_code);
    if (params?.limit) qs.set("limit", String(params.limit));
    return request<{ writings: any[] }>(`/writings?${qs}`);
  },

  getWriting: (id: string) => request<{ writing: any }>(`/writings/${id}`),

  createWriting: (data: any) =>
    request<{ writing: any }>("/writings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateWriting: (id: string, data: any) =>
    request<{ writing: any }>(`/writings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Classes
  getClasses: (params?: { teacher_id?: string }) => {
    const qs = new URLSearchParams();
    if (params?.teacher_id) qs.set("teacher_id", params.teacher_id);
    return request<{ classes: any[] }>(`/classes?${qs}`);
  },

  getClass: (code: string) =>
    request<{ classInfo: any; students: any[] }>(`/classes/${code}`),

  createClass: (data: { name: string; school_name?: string }) =>
    request<{ classInfo: any }>("/classes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  joinClass: (code: string) =>
    request<{ success: boolean }>(`/classes/${code}/join`, { method: "POST" }),

  // Assignments
  getAssignments: (classCode: string) =>
    request<{ assignments: any[] }>(`/assignments?class_code=${classCode}`),

  createAssignment: (data: any) =>
    request<{ assignment: any }>("/assignments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Stats
  getStudentStats: (userId: string) =>
    request<{ stats: any; errorPatterns: any[]; monthlyStats: any[] }>(
      `/stats/student?user_id=${userId}`,
    ),

  getClassStats: (classCode: string) =>
    request<{ stats: any }>(`/stats/class?class_code=${classCode}`),

  getWritingDNA: (userId: string) =>
    request<{ dna: any }>(`/stats/writing-dna?user_id=${userId}`),

  // Teacher feedback
  submitTeacherFeedback: (
    writingId: string,
    data: { type: string; message?: string },
  ) =>
    request<{ success: boolean }>(`/writings/${writingId}/feedback`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Self assessment
  submitSelfAssessment: (writingId: string, data: any) =>
    request<{ success: boolean }>(`/writings/${writingId}/self-assessment`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Error patterns
  getErrorPatterns: (userId: string) =>
    request<{ patterns: any[] }>(`/stats/error-patterns?user_id=${userId}`),

  // Admin
  getTeachers: () => request<{ teachers: any[] }>("/admin/teachers"),
  approveTeacher: (userId: string) =>
    request<{ success: boolean }>(`/admin/teachers/${userId}/approve`, {
      method: "POST",
    }),

  // Update check
  checkUpdate: () =>
    request<{ version: string; download_url: string; has_update: boolean }>(
      "/update-check",
    ),

  // Update user
  updateUser: (data: any) =>
    request<{ user: any }>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

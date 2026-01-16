export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
  },
  notes: {
    list: "/notes",
    create: "/notes",
    update: (id: string) => `/notes/${id}`,
    delete: (id: string) => `/notes/${id}`,
  },
  projects: {
    list: "/projects",
    create: "/projects",
    update: (id: string) => `/projects/${id}`,
    delete: (id: string) => `/projects/${id}`,
  },
  ai: {
    query: "/ai/query",
    analyzeResume: "/ai/analyze-resume",
  },
} as const;

import api from "./axios";

export const teacherApi = {
  getStats: (days: number = 7) => api.get(`/teacher/dashboard/stats?days=${days}`),
  getStudents: (days: number = 7, sort: string = "score") => 
    api.get(`/teacher/students?days=${days}&sort=${sort}`),
  getRequests: () => api.get("/teacher/requests"),
  approveRequest: (id: number) => api.post(`/teacher/requests/${id}/approve`),
  rejectRequest: (id: number) => api.post(`/teacher/requests/${id}/reject`),
  updateSettings: (data: any) => api.put("/teacher/settings", data),
};

import api from "./axios";

export const classroomApi = {
  join: (code: string) => api.post("/classroom/join", { unique_code: code }),
  leave: () => api.post("/classroom/leave"),
  getStatus: () => api.get("/classroom/status"),
};

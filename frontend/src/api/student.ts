import api from "./axios";

export const studentApi = {
  /**
   * Get all blocked websites for the current student
   */
  getBlockedSites: async () => {
    const response = await api.get("/student/blocked-sites");
    return response.data;
  },

  /**
   * Add a website to the blocklist
   */
  addBlockedSite: async (url: string, reason?: string) => {
    const response = await api.post("/student/blocked-sites", { url, reason });
    return response.data;
  },

  /**
   * Remove a website from the blocklist
   */
  removeBlockedSite: async (id: number) => {
    await api.delete(`/student/blocked-sites/${id}`);
  }
};

import api from "."

const dashboardService = {
  getDashboardData: () => api.get("/dashboard/data/")
}

export default dashboardService

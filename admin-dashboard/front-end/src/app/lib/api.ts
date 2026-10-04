import { DashboardData } from "../types/dashboard";

export async function getDashboardData(): Promise<DashboardData> {
  const response = await fetch("http://localhost:3000/api/dashboard", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}

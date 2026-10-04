import DashboardLayout from "../components/layout/DashboardLayout";
import SettingsClient from "../components/settings/SettingsClient";
import { readDb } from "../lib/db";

export default async function SettingsPage() {
  const db = await readDb();

  return (
    <DashboardLayout>
      <SettingsClient initialSettings={db.settings} />
    </DashboardLayout>
  );
}

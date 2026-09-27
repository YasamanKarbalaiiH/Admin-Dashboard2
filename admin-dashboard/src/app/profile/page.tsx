import DashboardLayout from "../components/layout/DashboardLayout";
import ProfileClient from "../components/profile/ProfileClient";
import { readDb } from "../lib/db";

export default async function ProfilePage() {
  const db = await readDb();

  return (
    <DashboardLayout>
      <ProfileClient initialProfile={db.profile} />
    </DashboardLayout>
  );
}

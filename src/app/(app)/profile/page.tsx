import { redirect } from "next/navigation";
import { getCurrentDriverProfile } from "@/lib/supabase/profile";

export default async function ProfilePage() {
  const driver = await getCurrentDriverProfile();
  redirect(driver ? `/drivers/${driver.id}` : "/groups");
}

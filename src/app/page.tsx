import { redirect } from "next/navigation";

// Default landing: redirect to Economy dashboard
export default function Home() {
  redirect("/economy");
}

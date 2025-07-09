import { Outlet } from "react-router";
import { redirect } from "react-router";
import authClient from "../lib/auth";
import type { Route } from "./+types/dashboard";

export const loader: Route.LoaderFunction = async ({ request }) => {
  const session = await authClient.getSession(request);
  if (!session) {
    return redirect("/login");
  }
  return { session };
};

export default function DashboardLayout() {
  return <Outlet />;
}

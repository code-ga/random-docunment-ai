"use client";
import { Outlet, useLocation } from "react-router";
import { useSession } from "../lib/auth";
import LoadingPage from "../components/LoadingPage";
import ErrorPage from "../components/ErrorPage";
import { useResolvedPath } from "react-router";
import DashboardNavbar from "../components/Navbar/DashboardNavbar";

export default function ProtectionRoute() {
  if (!window || typeof window === "undefined") {
    return <LoadingPage></LoadingPage>;
  }
  const { data, isPending: loading, error } = useSession();
  const { pathname } = useLocation();
  if (loading) {
    return <LoadingPage></LoadingPage>;
  }
  if (error) {
    return (
      <ErrorPage message={error.message} status={error.status}></ErrorPage>
    );
  }
  if (!data) {
    return (
      <ErrorPage
        message="Unauthorized Access: Token is missing"
        status={401}
      ></ErrorPage>
    );
  }
  return pathname.startsWith("/dashboard") ? (
    <main className="bg-[#0f172a] text-white min-h-screen">
      <DashboardNavbar></DashboardNavbar>
      <Outlet></Outlet>
    </main>
  ) : (
    <Outlet></Outlet>
  );
}

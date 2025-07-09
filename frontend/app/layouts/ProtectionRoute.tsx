"use client";
import { Outlet } from "react-router";
import { useSession } from "../lib/auth";
import LoadingPage from "../components/LoadingPage";
import ErrorPage from "../components/ErrorPage";

export function ProtectionRoute() {
  if (!window || typeof window === "undefined") {
    return <LoadingPage></LoadingPage>;
  }
  const { data, isPending: loading, error } = useSession();
  if (loading) {
    return <LoadingPage></LoadingPage>;
  }
  if (error) {
    return <ErrorPage message={error.message} status={error.status}></ErrorPage>;
  }
  if (!data) {
    return <ErrorPage message="Unauthorized Access: Token is missing" status={401}></ErrorPage>;
  }
  return <Outlet />;
}
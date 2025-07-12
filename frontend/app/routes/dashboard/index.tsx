import type { Route } from "../+types/home";
import MainDashboard from "../../dashboard";
import { client } from "../../lib/client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "study.ai" },
    { name: "description", content: "Welcome to study.ai!" },
  ];
}

export default function Dashboard() {
  return <MainDashboard></MainDashboard>;
}

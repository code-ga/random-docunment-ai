import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "study.ai" },
    { name: "description", content: "Welcome to study.ai!" },
  ];
}

export default function Dashboard() {
  return <>Dashboard</>;
}

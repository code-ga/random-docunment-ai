import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "study.ai" },
    { name: "description", content: "Welcome to study.ai!" },
  ];
}

export default function Home() {
  return <Welcome />;
}

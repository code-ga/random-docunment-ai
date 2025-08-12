import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),

  layout("layouts/ProtectionRoute.tsx", [
    ...prefix("dashboard", [
      index("routes/dashboard/index.tsx"),
      ...prefix("workspace", [
        route("create", "routes/dashboard/workspace/create.tsx"),
        route(":id", "routes/dashboard/workspace/info.tsx"),
      ]),
      ...prefix("quiz", [
        index("routes/dashboard/quiz/index.tsx"),
      ])
    ]),
  ])
] satisfies RouteConfig;

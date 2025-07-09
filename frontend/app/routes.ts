import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),

  layout("layouts/ProtectionRoute.tsx", [
    ...prefix("dashboard", [
      index("routes/dashboard/index.tsx"),
    ]),
  ])
] satisfies RouteConfig;

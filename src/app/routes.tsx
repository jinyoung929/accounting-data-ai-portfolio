import { createBrowserRouter, Outlet } from "react-router";
import { SiteProvider } from "./context";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import ProjectDetail from "./pages/ProjectDetail";

function Root() {
  return (
    <SiteProvider>
      <Outlet />
    </SiteProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "admin", Component: Admin },
      { path: "projects/:slug", Component: ProjectDetail },
    ],
  },
]);

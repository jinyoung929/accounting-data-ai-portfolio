import { createBrowserRouter, Outlet } from "react-router";
import { SiteProvider } from "./context";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

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
    ],
  },
]);

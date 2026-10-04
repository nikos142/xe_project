import Layout from "./Layout";
import * as routes from "./routes";
import Index from "../pages/Index";
import NotFound from "../pages/NotFound";
import Properties from "../pages/Properties";
import NewProperty from "../pages/NewProperty";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { element: <Index />, index: true },
      { element: <Properties />, path: routes.PROPERTIES_PAGE },
      { element: <NewProperty />, path: routes.NEW_PROPERTY },
      { element: <NotFound />, path: routes.ERROR },
    ],
  },
]);

export default router;

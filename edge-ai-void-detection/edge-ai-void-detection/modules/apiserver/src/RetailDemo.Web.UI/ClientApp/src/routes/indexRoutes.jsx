// layouts
import { Layout } from "../layouts/Layout.jsx";

// Import CSS & SCSS
//import "bootstrap/dist/css/bootstrap.min.css";

// Index routes is used to load a layout which will become the frame for the "view" components
const indexRoutes = [
    { path: "/web", component: Layout },
    /*{ path: "/auth", component: PagesLayout } Add here more layouts */
    { redirect: true, path: "/", pathTo: "/web/home", name: "Home" }
];

export default indexRoutes;

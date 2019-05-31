// views
import Home from "../views/Home/Home.jsx";
import Monitoring from "../views/Monitoring/Monitoring.jsx";
import MonitoringSlider from "../views/MonitoringSlider/MonitoringSlider.jsx";
import EdgeDevices from "../views/EdgeDevices/EdgeDevices.jsx";


const layoutRoutes = [
    {
        path: "/home",
        name: "Home",
        icon: "nc-icon nc-layout-11",
        component: Home,
        layout: "/web",
        barComponent: "NavBar"
    },
    {
        path: "/monitoring",
        name: "Monitoring",
        icon: "nc-icon nc-layout-11",
        component: Monitoring,
        layout: "/web",
        barComponent: "NavBar"
    },
    {
        path: "/monitoringslider",
        name: "MonitoringSlider",
        icon: "nc-icon nc-layout-11",
        component: MonitoringSlider,
        layout: "/web",
        barComponent: "NavBar"
    },
    {
        path: "/edgedevices",
        name: "Edge Devices",
        icon: "nc-icon nc-layout-11",
        component: EdgeDevices,
        layout: "/web",
        barComponent: "NavBar"
    },
    { redirect: true, path: "/", pathTo: "/web/home", name: "Home" }
];

export default layoutRoutes;

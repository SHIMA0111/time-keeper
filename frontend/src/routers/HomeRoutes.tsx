import {Home} from "../components/pages/Home.tsx";
import {BiHome} from "react-icons/bi";
import {IoSettingsOutline} from "react-icons/io5";
import {Setting} from "../components/pages/Setting.tsx";

export const HomeRoutes = [
    {
        path: "/",
        pageName: "Home",
        element: <Home />,
        icon: <BiHome />
    },
    {
        path: "/setting",
        pageName: "Setting",
        element: <Setting />,
        icon: <IoSettingsOutline />,
    }
]
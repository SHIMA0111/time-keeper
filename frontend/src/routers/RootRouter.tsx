import {Route, Routes} from "react-router-dom";
import {Login} from "../components/pages/Login.tsx";
import {Page404} from "../components/pages/Page404.tsx";
import {FC, memo} from "react";
import {HomeRoutes} from "./HomeRoutes.tsx";

export const RootRouter: FC = memo(() => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home/*" element={
                <Routes>
                    {HomeRoutes.map(route => (
                        <Route key={route.path} path={route.path} element={route.element} />
                    ))}
                </Routes>
            } />
            <Route path="*" element={<Page404 />} />
        </Routes>
    )
});
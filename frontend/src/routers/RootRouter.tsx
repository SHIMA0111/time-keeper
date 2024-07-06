import {Route, Routes} from "react-router-dom";
import {Login} from "../components/pages/Login.tsx";
import {Page404} from "../components/pages/Page404.tsx";
import {FC, memo} from "react";
import {HomeRoutes} from "./HomeRoutes.tsx";
import {Register} from "../components/pages/Register.tsx";
import {RouteGuardUnAuthorize} from "./RouteGuardUnAuthorize.tsx";
import {HomeFlame} from "../components/uiParts/flames/HomeFlame/HomeFlame.tsx";

export const RootRouter: FC = memo(() => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home/*" element={
                <RouteGuardUnAuthorize>
                    <Routes>
                        {HomeRoutes.map(route => (
                            <Route key={route.path} path={route.path} element={
                                    <HomeFlame>
                                        {route.element}
                                    </HomeFlame>
                            } />
                        ))}
                        <Route path="*" element={<Page404 />} />
                    </Routes>
                </RouteGuardUnAuthorize>
            } />
            <Route path="*" element={<Page404 />} />
        </Routes>
    )
});
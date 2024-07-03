import {Route, Routes} from "react-router-dom";
import {Login} from "../components/pages/Login.tsx";
import {Page404} from "../components/pages/Page404.tsx";
import {FC, memo} from "react";
import {HomeRoutes} from "./HomeRoutes.tsx";
import {Register} from "../components/pages/Register.tsx";
import {RouteGuardUnAuthorize} from "./RouteGuardUnAuthorize.tsx";
import {HomeFlame} from "../components/uiParts/flames/HomeFlame/HomeFlame.tsx";
import {Helmet} from "react-helmet";

export const RootRouter: FC = memo(() => {
    const appName = "Time Keeper";
    return (
        <Routes>
            <Route path="/" element={
                <>
                    <Helmet>
                        <title>{`Login | ${appName}`}</title>
                    </Helmet>
                    <Login />
                </>
            } />
            <Route path="/register" element={
                <>
                    <Helmet>
                        <title>{`Register | ${appName}`}</title>
                    </Helmet>
                    <Register />
                </>
            } />
            <Route path="/home/*" element={
                <RouteGuardUnAuthorize>
                    <Routes>
                        {HomeRoutes.map(route => (
                            <Route key={route.path} path={route.path} element={
                                <>
                                    <Helmet>
                                        <title>
                                            {`${route.pageName} | ${appName}`}
                                        </title>
                                    </Helmet>
                                    <HomeFlame>
                                        {route.element}
                                    </HomeFlame>
                                </>
                            } />
                        ))}
                    </Routes>
                </RouteGuardUnAuthorize>
            } />
            <Route path="*" element={
                <>
                    <Helmet>
                        <title>{`Not Found | ${appName}`}</title>
                    </Helmet>
                    <Page404 />
                </>
            } />
        </Routes>
    )
});
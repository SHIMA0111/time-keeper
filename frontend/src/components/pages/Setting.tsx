import {FC, memo} from "react";
import {HomeFlame} from "../uiParts/flames/HomeFlame/HomeFlame.tsx";
import {SettingTab} from "../uiParts/tabs/SettingTab.tsx";

export const Setting: FC = memo(() => {
    return (
        <HomeFlame>
            <SettingTab />
        </HomeFlame>
    )
})
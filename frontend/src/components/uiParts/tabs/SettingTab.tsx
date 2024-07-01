import {FC, memo} from "react";
import {
    Flex,
    Tab,
    TabList,
    TabPanels,
    Tabs,
} from "@chakra-ui/react";
import {UserSettingTab} from "./SettingTab/UserSettingTab.tsx";
import {TableSettingTab} from "./SettingTab/TableSettingTab.tsx";
import {CategorySettingTab} from "./SettingTab/CategorySettingTab.tsx";

export const SettingTab: FC = memo(() => {
    return (
        <Flex my={{base: "16px", md: "5%"}} justify="center">
            <Tabs
                w={{ base: "85%", md: "70%", lg: "60%"}}
                borderRadius="8px"
                bgColor="#fff"
                p="16px 24px">
                <TabList>
                    <Tab>ユーザ設定</Tab>
                    <Tab>テーブル設定</Tab>
                    <Tab>カテゴリ設定</Tab>
                </TabList>
                <TabPanels>
                    <UserSettingTab />
                    <TableSettingTab />
                    <CategorySettingTab />
                </TabPanels>
            </Tabs>
        </Flex>
    );
})
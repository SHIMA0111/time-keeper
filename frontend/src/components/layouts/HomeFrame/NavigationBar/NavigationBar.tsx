import {FC, memo} from "react";
import {Flex} from "@chakra-ui/react";
import {HomeNavigations} from "./HomeNavigations.tsx";
import {IconButtonWithName} from "../../../uiParts/buttons/IconButtonWithName.tsx";
import {BiLogOut} from "react-icons/bi";

export const NavigationBar: FC = memo(() => {
    return (
        <Flex as="aside" h="92%" flexDirection="column" justify="space-between">
            <Flex flexDirection="column" overflow="scroll">
                {HomeNavigations.map(route => (
                    <IconButtonWithName key={route.pageName} icon={route.icon} w="100%">
                        {route.pageName}
                    </IconButtonWithName>
                ))}
            </Flex>
            <IconButtonWithName
                icon={<BiLogOut />}>ログアウト</IconButtonWithName>
        </Flex>
    )
});
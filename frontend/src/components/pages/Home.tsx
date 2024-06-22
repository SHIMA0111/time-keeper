import {Box} from "@chakra-ui/react";
import {FC, memo} from "react";
import {HomeFlame} from "../uiParts/flames/HomeFlame/HomeFlame.tsx";

export const Home: FC = memo(() => {
    return (
        <HomeFlame>
            <Box h="50%" bgColor="skyblue"></Box>
            <Box h="50%" bgColor="palegreen"></Box>
        </HomeFlame>
    )
});
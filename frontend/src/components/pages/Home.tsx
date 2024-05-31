import {Box} from "@chakra-ui/react";
import {HomeFlame} from "../layouts/HomeFrame/HomeFlame.tsx";
import {FC, memo} from "react";

export const Home: FC = memo(() => {
    
    return (
        <HomeFlame>
            <Box h={{base: "85%", md: "92%"}} bgColor="green">
                <Box h="20%" bgColor="green"></Box>
                <Box h="40%" bgColor="white"></Box>
                <Box h="40%" bgColor="skyblue"></Box>
            </Box>
        </HomeFlame>
    )
});
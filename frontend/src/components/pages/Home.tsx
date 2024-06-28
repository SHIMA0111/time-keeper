import {Box} from "@chakra-ui/react";
import {FC, memo} from "react";

export const Home: FC = memo(() => {
    return (
        <>
            <Box h="50%" bgColor="skyblue"></Box>
            <Box h="50%" bgColor="palegreen"></Box>
        </>
    )
});
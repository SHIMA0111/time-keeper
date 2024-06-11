import {Box} from "@chakra-ui/react";
import {HomeFlame} from "../layouts/HomeFrame/HomeFlame.tsx";
import {FC, memo} from "react";
import {SimpleRecordDisplay} from "../layouts/HomeFrame/SimpleRecordDisplay.tsx";
import {useCategoryTableSetting} from "../../hooks/useCategoryTableSetting.tsx";

export const Home: FC = memo(() => {
    const { categoryInfo, categoryNames } = useCategoryTableSetting();
    
    return (
        <HomeFlame categoryNames={categoryNames} contentNum={categoryInfo.contents_num}>
            <Box h={{base: "85%", md: "92%"}} bgColor="gray.200">
                <Box h="50%" bgColor="skyblue"></Box>
                <SimpleRecordDisplay categoryNames={categoryNames} />
            </Box>
        </HomeFlame>
    )
});
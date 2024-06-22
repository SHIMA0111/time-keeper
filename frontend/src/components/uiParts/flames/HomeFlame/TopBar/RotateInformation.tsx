import {FC, memo, useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Box, Tooltip} from "@chakra-ui/react";
import {useRecoilValue} from "recoil";
import {categoriesData} from "../../../../../recoil/category/categoryData.ts";

const MotionBox = motion(Box);


export const RotateInformation: FC = memo(() => {
    const categories = useRecoilValue(categoriesData);
    
    const [displayState, setDisplayState] = useState<number>(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setDisplayState(prevState => (prevState + 1) % categories.length);
        }, 5000);
        
        return () => clearInterval(timer);
    }, [categories.length]);
    
    return (
        <AnimatePresence mode="wait">
            <Tooltip label={categories[displayState]?.display_name}>
                <MotionBox
                    key={displayState}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}>
                    {categories[displayState]?.display_name}
                </MotionBox>
            </Tooltip>
        </AnimatePresence>
    );
});
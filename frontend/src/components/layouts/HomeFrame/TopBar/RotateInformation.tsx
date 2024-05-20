import {FC, memo, useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Box, Tooltip} from "@chakra-ui/react";

const MotionBox = motion(Box);

type Props = {
    information: string[]
}

export const RotateInformation: FC<Props> = memo((props) => {
    const { information } = props;

    const [displayState, setDisplayState] = useState<number>(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setDisplayState(prevState => (prevState + 1) % information.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [information]);

    return (
        <AnimatePresence mode="wait">
            <Tooltip label={information[displayState]}>
                <MotionBox
                    key={displayState}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}>
                    {information[displayState]}
                </MotionBox>
            </Tooltip>
        </AnimatePresence>
    );
});
import {FC, memo, useEffect, useState} from "react";
import {Box, Flex, Skeleton, Text} from "@chakra-ui/react";
import {MdFiberManualRecord} from "react-icons/md";
import {IoMdPause} from "react-icons/io";
import init, {second_to_str} from "wasm-tools";
import {useRecoilValue} from "recoil";
import {userState} from "../../../../recoil/user/userState.ts";

type Props = {
    isRecording: boolean;
    isPaused: boolean;
    isCalculating: boolean;
    seconds: number;
}

export const RecordingDisplay: FC<Props> = memo((props) => {
    const username = useRecoilValue(userState);
    
    const [elapsedTime, setElapsedTime] = useState("00:00:00");
    const [displayTime, setDisplayTime] = useState<boolean>(true);
    const { isRecording, seconds, isPaused, isCalculating } = props;
    
    const baseOpacity = isRecording ? 1.0 : 0.8;
    
    useEffect(() => {
        init().then(() => {
            setElapsedTime(second_to_str(BigInt(seconds)))
        })
    }, [seconds]);
    
    useEffect(() => {
        let timer: number | undefined;
        if (isPaused) {
            if (isPaused) {
                timer = setInterval(() => {
                    setDisplayTime((prev) => !prev);
                }, 500);
            }
        }
        else {
            setDisplayTime(true);
        }
        
        return () => clearInterval(timer);
    }, [isPaused]);
    
    return (
        <Flex align="center" justify="space-between" h="40%" px="16px" boxShadow="0 0 1px 0">
            <Flex align="center">
                <Box
                    color={isRecording ? "#f00" : "#000"}
                    opacity={baseOpacity}
                >
                    { isPaused ? <IoMdPause color="green" /> : <MdFiberManualRecord /> }
                </Box>
                <Skeleton isLoaded={!isCalculating}>
                    <Box
                        ml="8px"
                        fontSize="sm"
                        opacity={ displayTime ? baseOpacity : 0 }
                    >{elapsedTime}</Box>
                </Skeleton>
            </Flex>
            <Box fontSize="sm" cursor="default">
                こんにちは、
                <Text
                    display="inline"
                    color="blue"
                    fontWeight="bold"
                    cursor="pointer"
                >
                    {username}
                </Text>
                さん
            </Box>
        </Flex>
    )
});
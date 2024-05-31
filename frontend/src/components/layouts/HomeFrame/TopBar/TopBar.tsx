import {FC, memo, useCallback} from "react";
import {
    Box,
    Flex,
    useDisclosure
} from "@chakra-ui/react";
import {MdFiberManualRecord} from "react-icons/md";
import {IoStopSharp} from "react-icons/io5";
import {IoMdPause} from "react-icons/io";
import {IconButton} from "../../../uiParts/buttons/IconButton.tsx";
import {RecordingDisplay} from "./RecordingDisplay.tsx";
import {SettingsIcon} from "@chakra-ui/icons";
import {NoShadowSelect} from "../../../uiParts/inputs/NoShadowSelect.tsx";
import {DetailModal} from "./DetailModal.tsx";
import {CurrentSettingDisplay} from "./CurrentSettingDisplay.tsx";
import {useTimeCounter} from "../../../../hooks/useTimeCounter.tsx";
import {Record} from "../../../../types/api/record.ts";
import {useToastMessage} from "../../../../hooks/useToastMessage.tsx";

const classes = ["カテゴリ", "サブカテゴリ ", "補足1", "補足2"];

export const TopBar: FC = memo(() => {
    const {
        isPaused, isRecording, isSaving, isCalculating,
        time, onStart, onPause, onStop, storedValueGet} = useTimeCounter();
    const { toastMessage } = useToastMessage();
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const onClickStop = useCallback(() => {
        const tmpRecordOnBrowser = storedValueGet();
        if (tmpRecordOnBrowser) {
            const record: Record = {
                uid: "dummy",
                category: "dummyCategory",
                subcategory: "dummySubCategory",
                option1: undefined,
                option2: undefined,
                start: tmpRecordOnBrowser.startTime,
                end: new Date().getTime(),
                pauseStarts: tmpRecordOnBrowser.pauseStartTime,
                pauseEnds: tmpRecordOnBrowser.pauseEndTime,
            };
            console.log(record);
        }
        else {
            toastMessage({
                status: "error",
                title: "Failed save the time record...",
                description: 'Your time record can\'t load from your browser.\n' +
                    'If you face this error in many times, please contact the developer.'
            })
        }
        
        onStop();
    }, [onStop, storedValueGet, toastMessage]);
    
    return (
        <>
            <Box h={{base: "15%", md: "8%"}}>
                <RecordingDisplay isRecording={isRecording} isPaused={isPaused} isCalculating={isCalculating} seconds={time} />
                <Flex h="60%" px="8px" align="center" justify="space-between">
                    <Flex align="center" w={{base: "30%", sm: "50%", md: "70%"}}>
                        <IconButton
                            onClick={isRecording && !isPaused ? onPause : onStart}
                            icon={
                                isRecording && !isPaused ?
                                    <IoMdPause color={ isSaving ? "gray" : "green"} /> :
                                    <MdFiberManualRecord color="red" />
                            }
                            disabled={isSaving} />
                        <IconButton
                            onClick={onClickStop}
                            icon={<IoStopSharp color={ isRecording ? "blue" : "gray" } />}
                            disabled={!isRecording}
                            isLoading={isSaving} />
                        <CurrentSettingDisplay information={classes} />
                    </Flex>
                    <Flex align="center" w={{base: "70%", sm: "50%", md: "30%"}}>
                        <NoShadowSelect placeholder="カテゴリエイリアスを選択" size="sm"></NoShadowSelect>
                        <IconButton icon={<SettingsIcon />} spinnerSize={24} onClick={onOpen} />
                    </Flex>
                </Flex>
            </Box>
            <DetailModal isOpen={isOpen} onClose={onClose} formContentNames={classes} />
        </>
    )
});

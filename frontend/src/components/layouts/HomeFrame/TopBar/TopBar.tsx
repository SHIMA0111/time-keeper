import {FC, memo} from "react";
import {Box, Flex, useDisclosure} from "@chakra-ui/react";
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
import {Names} from "../../../../types/api/categorySetting.ts";

type Props = {
    contentNums: number;
    categoryNames: Names[];
}

export const TopBar: FC<Props> = memo((props) => {
    const { categoryNames, contentNums } = props;
    const {
        isPaused,
        isRecording,
        isSaving,
        isCalculating,
        time,
        onStart,
        onPause,
        onClickStop,
        validCategory} = useTimeCounter();
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            <Box h={{base: "15%", md: "8%"}}>
                <RecordingDisplay isRecording={isRecording} isPaused={isPaused} isCalculating={isCalculating} seconds={time} />
                <Flex h="60%" px="8px" align="center" justify="space-between">
                    <Flex align="center" w={{base: "30%", sm: "50%", md: "70%"}}>
                        <IconButton
                            tooltipMessage={!validCategory ? "保存処理中です" : "カテゴリを設定してください"}
                            onClick={isRecording && !isPaused ? onPause : onStart}
                            icon={
                                isRecording && !isPaused ?
                                    <IoMdPause color={ isSaving ? "gray" : "green"} /> :
                                    <MdFiberManualRecord color={ !validCategory || isSaving ? "gray" : "red"} />
                            }
                            disabled={!validCategory || isSaving} />
                        <IconButton
                            onClick={onClickStop}
                            icon={<IoStopSharp color={ isRecording ? "blue" : "gray" } />}
                            disabled={!isRecording}
                            isLoading={isSaving} />
                        <CurrentSettingDisplay information={categoryNames} contents_num={contentNums} />
                    </Flex>
                    <Flex align="center" w={{base: "70%", sm: "50%", md: "30%"}}>
                        <NoShadowSelect placeholder="カテゴリエイリアスを選択" size="sm"></NoShadowSelect>
                        <IconButton icon={<SettingsIcon />} spinnerSize={24} onClick={onOpen} />
                    </Flex>
                </Flex>
            </Box>
            <DetailModal isOpen={isOpen} onClose={onClose} formContentNames={categoryNames} />
        </>
    )
});

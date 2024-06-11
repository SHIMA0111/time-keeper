import {useCallback, useEffect, useState} from "react";
import {TmpTimeData} from "../types/tmpData/TmpTimeData.ts";
import init, {calc_time} from "wasm-tools";
import {RecordInput} from "../types/api/record.ts";
import {useToastMessage} from "./useToastMessage.tsx";
import {useRecoilValue} from "recoil";
import {selectedCategoryState} from "../recoil/category/selectedCategoryState.ts";
import {useAuthedEndpoint} from "./useAuthedEndpoint.tsx";
import {Response} from "../types/api/response.ts";

export const useTimeCounter = () => {
    const [validCategory, setValidCategory] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isCalculating, setIsCalculating] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [time, setTime] = useState<number>(0);
    const categoryValue = useRecoilValue(selectedCategoryState);
    const authAxiosEndpoint = useAuthedEndpoint("http://localhost:8888/");
    
    const { toastMessage } = useToastMessage();
    
    const storedValueGet = useCallback((): TmpTimeData | undefined => {
        const storedValue = localStorage.getItem("recordData");
        if (!storedValue) return undefined;
        return JSON.parse(storedValue);
    }, []);
    
    const storedValueSet = useCallback((value: TmpTimeData) => {
        localStorage.setItem("recordData", JSON.stringify(value));
    }, []);
    
    useEffect(() => {
        setValidCategory(!!categoryValue.top.name);
    }, [categoryValue.top]);
    
    useEffect(() => {
        let timer: number | undefined;
        if (isRecording && !isPaused) {
            timer = setInterval(() => setTime(prevTime => prevTime + 1), 1000);
        }
        
        return () => clearInterval(timer);
    }, [isRecording, isPaused]);
    
    useEffect(() => {
        const storedTime = storedValueGet();
        if (!storedTime) {
            setIsCalculating(false);
            return;
        }

        const { startTime, pauseStartTime, pauseEndTime } = storedTime;
        setIsRecording(true);
        let validatePauseEndTime;
        if (pauseStartTime.length < pauseEndTime.length) {
            validatePauseEndTime = pauseEndTime.slice(0, pauseStartTime.length);
        }
        else {
            validatePauseEndTime = pauseEndTime;
        }

        if (pauseStartTime.length > validatePauseEndTime.length) {
            setIsPaused(true);
        }
        const bigIntPauseStarts = new BigUint64Array(pauseStartTime.map(value => BigInt(value)));
        const bigIntPauseEnds = new BigUint64Array(validatePauseEndTime.map(value => BigInt(value)));

        init().then(() => {
            const elapsed_time = calc_time(BigInt(startTime), bigIntPauseStarts, bigIntPauseEnds);
            if (!elapsed_time) {
                console.error("Elapsed time calculation failed.");
                setIsCalculating(false);
                return;
            }
            
            const elapsedSeconds = Math.floor(Number(elapsed_time) / 1000);
            setTime(elapsedSeconds);
            setIsCalculating(false);
        })
    }, [storedValueGet, storedValueSet]);
    
    const onStart = useCallback(() => {
        const storedValue = storedValueGet();
        if (!storedValue) {
            const startTime = new Date().getTime();
            storedValueSet({
                startTime,
                pauseStartTime: [],
                pauseEndTime: [],
            });
        }
        else {
            const { startTime, pauseStartTime, pauseEndTime } = storedValue;
            storedValueSet({
                startTime,
                pauseStartTime,
                pauseEndTime: [...pauseEndTime, new Date().getTime()],
            });
        }

        setIsRecording(true);
        setIsPaused(false);
    }, [storedValueSet, storedValueGet]);
    
    const onPause = useCallback(() => {
        const storedValue = storedValueGet();
        if (!storedValue) return;
        const { startTime, pauseStartTime, pauseEndTime } = storedValue;
        storedValueSet({
            startTime,
            pauseStartTime: [...pauseStartTime, new Date().getTime()],
            pauseEndTime,
        });
        setIsPaused(true);
    }, [storedValueGet, storedValueSet]);
    
    const onStop = useCallback(() => {
        setIsSaving(true);
        
        localStorage.removeItem("recordData");
        setIsRecording(false);
        setIsPaused(false);
        setTime(0);
        
        setIsSaving(false);
    }, []);
    
    const onClickStop = useCallback(() => {
        const tmpRecordOnBrowser = storedValueGet();
        if (tmpRecordOnBrowser) {
            const record: RecordInput = {
                top_id: categoryValue.top.id,
                sub1_id: categoryValue.sub1?.id,
                sub2_id: categoryValue.sub2?.id,
                sub3_id: categoryValue.sub3?.id,
                sub4_id: categoryValue.sub4?.id,
                start: tmpRecordOnBrowser.startTime,
                end: new Date().getTime(),
                pause_starts: tmpRecordOnBrowser.pauseStartTime,
                pause_ends: tmpRecordOnBrowser.pauseEndTime,
            };
            authAxiosEndpoint.post<Response>("/register_record", record)
                .then(res => {
                    console.log(res);
                })
                .catch(err => console.error(err))
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
    }, [categoryValue, onStop, storedValueGet, toastMessage, authAxiosEndpoint]);
    
    return { onStart, onPause, isRecording, isCalculating, isSaving, isPaused, time, onClickStop, validCategory }
}
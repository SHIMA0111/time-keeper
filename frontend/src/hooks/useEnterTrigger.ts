import {useEffect} from "react";

export const useEnterTrigger = (enableEnterTrigger: boolean, componentIsDisabled: boolean, enterTriggeredFunction: () => void) => {
    useEffect(() => {
        if (!enableEnterTrigger) return;
        const pushEnter = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !componentIsDisabled) {
                enterTriggeredFunction();
            }
        }
        
        document.addEventListener("keydown", pushEnter);
        
        return () => document.removeEventListener("keydown", pushEnter);
    }, [enableEnterTrigger, enterTriggeredFunction, componentIsDisabled]);
}
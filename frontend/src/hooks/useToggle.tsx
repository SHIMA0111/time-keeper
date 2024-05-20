import {useCallback, useState} from "react";

export const useToggle = (initState: boolean = false):[boolean, () => void] => {
    const [isSwitch, setIsSwitch] = useState<boolean>(initState);
    const onToggle = useCallback(() => {
        setIsSwitch(!isSwitch)
    }, [isSwitch]);
    
    return [isSwitch, onToggle];
};
import {Dispatch, FC, memo, SetStateAction, useCallback, useEffect, useState} from "react";
import {FormControl, FormLabel} from "@chakra-ui/react";
import {EditableInputWithButton} from "./EditableInputWithButton.tsx";

type Props = {
    label: string;
    value: string;
    setFunction: Dispatch<SetStateAction<string>>,
    isDisplayLabel?: boolean;
    w?: string;
    setIsUpdatedDispatch?: Dispatch<SetStateAction<boolean>>,
}

export const EditableForm: FC<Props> = memo((props) => {
    const {label,
        value,
        setFunction,
        isDisplayLabel=true,
        w,
        setIsUpdatedDispatch} = props;
    const [isUpdated, setIsUpdated] = useState(false);
    const updateValue = useCallback((newValue: string) => {
        if (!isUpdated) {
            setIsUpdated(true)
        }
        setFunction(newValue)
    }, [isUpdated, setFunction]);
    useEffect(() => {
        if (setIsUpdatedDispatch) {
            setIsUpdatedDispatch(isUpdated);
        }
    }, [isUpdated, setIsUpdatedDispatch]);
    
    return (
        <FormControl>
            {
                isDisplayLabel && <FormLabel>{label}</FormLabel>
            }
            <EditableInputWithButton
                isUpdated={isUpdated}
                aliaName={label}
                value={value}
                w={w}
                onSubmit={updateValue} />
        </FormControl>
    )
});
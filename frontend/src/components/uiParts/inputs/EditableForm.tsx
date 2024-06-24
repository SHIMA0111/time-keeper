import {Dispatch, FC, memo, SetStateAction, useCallback, useState} from "react";
import {FormControl, FormLabel} from "@chakra-ui/react";
import {EditableInputWithButton} from "./EditableInputWithButton.tsx";

type Props = {
    label: string;
    value: string;
    setFunction: Dispatch<SetStateAction<string>>,
}

export const EditableForm: FC<Props> = memo((props) => {
    const {label, value, setFunction} = props;
    const [isUpdated, setIsUpdated] = useState(false);
    const updateValue = useCallback((newValue: string) => {
        if (!isUpdated) {
            setIsUpdated(true)
        }
        setFunction(newValue)
    }, [isUpdated, setFunction]);
    
    return (
        <FormControl>
            <FormLabel>{label}</FormLabel>
            <EditableInputWithButton
                isUpdated={isUpdated}
                aliaName={label}
                value={value}
                onChange={updateValue} />
        </FormControl>
    )
});
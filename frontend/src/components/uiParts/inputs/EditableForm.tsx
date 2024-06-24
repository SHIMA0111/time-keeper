import {Dispatch, FC, memo, SetStateAction, useCallback} from "react";
import {FormControl, FormLabel} from "@chakra-ui/react";
import {EditableInputWithButton} from "./EditableInputWithButton.tsx";

type Props = {
    label: string;
    value: string;
    setFunction: Dispatch<SetStateAction<string>>,
}

export const EditableForm: FC<Props> = memo((props) => {
    const {label, value, setFunction} = props;
    const updateValue = useCallback((newValue: string) => {
        console.log("Update!");
        setFunction(newValue)
    }, [setFunction]);
    
    return (
        <FormControl>
            <FormLabel>{label}</FormLabel>
            <EditableInputWithButton aliaName={label} value={value} onChange={updateValue} />
        </FormControl>
    )
});
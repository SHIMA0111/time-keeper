import {ChangeEvent, FC, memo} from "react";
import {FormControl, FormLabel} from "@chakra-ui/react";
import {EditableInputWithButton} from "./EditableInputWithButton.tsx";

type Props = {
    label: string;
    defaultValue: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const EditableForm: FC<Props> = memo((props) => {
    const {label, defaultValue, onChange} = props;
    
    return (
        <FormControl>
            <FormLabel>{label}</FormLabel>
            <EditableInputWithButton aliaName={label.toLowerCase()} defaultValue={defaultValue} onChange={onChange} />
        </FormControl>
    )
});
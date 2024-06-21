import {ChangeEvent, FC, memo} from "react";
import {Editable, EditableInput, EditablePreview, IconButton, Input, useEditableControls} from "@chakra-ui/react";
import {FaEdit} from "react-icons/fa";

type EditableComponentProps = {
    aliaName: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const EditableInputComponent: FC<EditableComponentProps> = memo((props) => {
    const {onChange, aliaName} = props;
    const { isEditing, getEditButtonProps } = useEditableControls();
    
    return (
        <>
            <EditablePreview p="8px" />
            <Input as={EditableInput} onChange={onChange} p="8px" />
            {
                isEditing || <IconButton
                    aria-label={`editable_${aliaName}`}
                    p={0}
                    bgColor="transparent"
                    icon={<FaEdit />}
                    _focusVisible={{
                        boxShadow: "none",
                    }}
                    {...getEditButtonProps()}/>
            }
        </>
    )
})

type EditableInputWithButtonType = {
    defaultValue: string;
    aliaName: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const EditableInputWithButton: FC<EditableInputWithButtonType> = memo((props) => {
    const {defaultValue, onChange, aliaName} = props;
    
    return (
        <Editable defaultValue={defaultValue} isPreviewFocusable={false}>
            <EditableInputComponent aliaName={aliaName} onChange={onChange} />
        </Editable>
    )
})

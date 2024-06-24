import {FC, memo} from "react";
import {
    Editable,
    EditableInput,
    EditablePreview,
    IconButton,
    Input,
    Skeleton,
    useEditableControls
} from "@chakra-ui/react";
import {FaEdit} from "react-icons/fa";

type EditableComponentProps = {
    aliaName: string;
}

const EditableInputComponent: FC<EditableComponentProps> = memo((props) => {
    const {aliaName} = props;
    const { isEditing, getEditButtonProps } = useEditableControls();
    
    return (
        <>
            <EditablePreview p="8px" />
            <Input as={EditableInput} p="8px" />
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
    value: string;
    aliaName: string;
    isUpdated: boolean;
    onChange: (nextValue: string) => void;
}

export const EditableInputWithButton: FC<EditableInputWithButtonType> = memo((props) => {
    const {value, onChange, aliaName, isUpdated} = props;
    
    return (
        <Skeleton isLoaded={(!!value || isUpdated)}>
            <Editable value={value} isPreviewFocusable={false} onChange={onChange}>
                <EditableInputComponent aliaName={aliaName} />
            </Editable>
        </Skeleton>
    )
})

import React, {FC, memo, useState} from "react";
import {
    Box,
    Editable,
    EditableInput,
    EditablePreview,
    IconButton, Input,
    Skeleton,
    useEditableControls
} from "@chakra-ui/react";
import {FaEdit} from "react-icons/fa";

type EditableComponentProps = {
    aliaName: string;
    w?: string;
}

const EditableInputComponent: FC<EditableComponentProps> = memo((props) => {
    const [isComposite, setIsComposite] = useState(false);
    const {aliaName, w = "100%"} = props;
    const { isEditing, getEditButtonProps } = useEditableControls();
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && isComposite) {
            e.preventDefault();
        }
    };
    const handleCompositionStart = () => {
        setIsComposite(true);
    };
    
    const handleCompositionEnd = () => {
        setIsComposite(false);
    };
    
    
    return (
        <Box w={w} px="8px" >
            <EditablePreview />
            <Input as={EditableInput}
                   onKeyDown={handleKeyDown}
                   onCompositionStart={handleCompositionStart}
                   onCompositionEnd={handleCompositionEnd} p="8px" />
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
        </Box>
    )
})

type EditableInputWithButtonType = {
    value: string;
    aliaName: string;
    isUpdated: boolean;
    onChange: (nextValue: string) => void;
    w?: string;
}

export const EditableInputWithButton: FC<EditableInputWithButtonType> = memo((props) => {
    const {value, onChange, aliaName, isUpdated, w} = props;
    
    return (
        <Skeleton isLoaded={(!!value || isUpdated)}>
            <Editable value={value} isPreviewFocusable={false} onChange={onChange}>
                <EditableInputComponent aliaName={aliaName} w={w} />
            </Editable>
        </Skeleton>
    )
})

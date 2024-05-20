import React, {FC, memo, ReactNode} from "react";
import {
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement
} from "@chakra-ui/react";

type Props = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    errorMessage?: string;
    isValid?: boolean;
    placeholder?: string;
    type?: "text" | "password";
    label?: string;
    leftIcon?: {
        icon: ReactNode;
        onClick?: () => void;
    };
    rightIcon?: {
        icon: ReactNode;
        onClick?: () => void;
    };
    readOnly?: boolean;
}

export const FormInput: FC<Props> = memo((props) => {
    const {
        value,
        onChange,
        onBlur,
        isValid=true,
        placeholder,
        errorMessage="" ,
        type="text",
        label,
        leftIcon,
        rightIcon,
        readOnly = false} = props;
    
    return (
        <FormControl
            isInvalid={!isValid}
            userSelect="none"
        >
            {label && <FormLabel fontSize="sm">{label}</FormLabel>}
            <InputGroup>
                {leftIcon && (
                    <InputLeftElement
                        onClick={leftIcon.onClick}
                        _hover={leftIcon.onClick ? {cursor: "pointer"} : {}}
                    >
                        {leftIcon.icon}
                    </InputLeftElement>
                )}
                <Input
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    type={type}
                    readOnly={readOnly}
                    _focusVisible={{
                        outline: "none",
                        boxShadow: "none",
                    }}
                    _invalid={{
                        boxShadow: "none",
                        borderColor: "red",
                        borderWidth: "1px",
                    }}
                    _hover={{}}
                />
                {
                    rightIcon && (
                        <InputRightElement
                            onClick={rightIcon.onClick}
                            _hover={rightIcon.onClick ? {cursor: "pointer"} : {}}
                        >
                            {rightIcon.icon}
                        </InputRightElement>
                    )
                }
            </InputGroup>
            {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
        </FormControl>
    )
});
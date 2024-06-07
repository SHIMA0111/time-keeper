import {ChangeEvent, FC, memo, ReactNode} from "react";
import {Select} from "@chakra-ui/react";

type Props = {
    children?: ReactNode;
    placeholder?: string;
    size?: string;
    fontSize?: string;
    isDisabled?: boolean;
    index?: number;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export const NoShadowSelect: FC<Props> = memo((props) => {
    const {
        children,
        size,
        placeholder,
        fontSize,
        onChange,
        isDisabled = false,
        value
    } = props;
    
    
    
    return (
        <Select
            isDisabled={isDisabled}
            placeholder={placeholder}
            size={size}
            value={value}
            fontSize={fontSize}
            onChange={onChange}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            cursor="pointer"
            _focusVisible={{
                boxShadow: "none"
            }}
        >{children}</Select>
    )
});
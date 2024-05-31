import {FC, memo, ReactNode} from "react";
import {Select} from "@chakra-ui/react";

type Props = {
    children?: ReactNode;
    placeholder?: string;
    size?: string;
    fontSize?: string;
}

export const NoShadowSelect: FC<Props> = memo((props) => {
    const { children, size, placeholder, fontSize } = props;

    return (
        <Select
            placeholder={placeholder}
            size={size}
            fontSize={fontSize}
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
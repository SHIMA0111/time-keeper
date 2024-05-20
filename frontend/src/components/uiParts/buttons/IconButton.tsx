import {FC, memo, ReactNode} from "react";
import {Box, Spinner} from "@chakra-ui/react";

type Props = {
    icon: ReactNode,
    onClick?: () => void;
    spinnerSize?: number;
    isLoading?: boolean;
    border?: string;
    disabled?: boolean;
    opacity?: number;
}

export const IconButton: FC<Props> = memo((props) => {
    const {
        icon,
        onClick,
        isLoading=false,
        spinnerSize=16,
        opacity=1,
        disabled=false,
        border} = props;

    return (
        <Box
            as="button"
            p={{ base: "16px", md: "8px" }}
            display="flex"
            justifyContent="center"
            alignItems="center"
            boxSizing="content-box"
            borderRadius="4px"
            onClick={disabled ? undefined : onClick}
            cursor={disabled ? "not-allowed" : "pointer"}
            border={border}
            opacity={opacity}
            _hover={disabled ? {} : {
                bgColor: "rgba(0, 0, 0, 0.1)",
                shadow: "lg",
            }}
            _active={disabled ? {} : {
                bgColor: "transparent",
                shadow: "none"
            }}
        >
            { isLoading ?
                <Spinner h={`${spinnerSize}px`} w={`${spinnerSize}px`} speed="1.0s" /> : icon }
        </Box>
    )
});
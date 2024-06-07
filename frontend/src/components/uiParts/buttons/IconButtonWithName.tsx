import {FC, memo, ReactNode} from "react";
import {Box, Flex} from "@chakra-ui/react";

type Props = {
    children: ReactNode;
    w?: number | string;
    icon?: ReactNode;
    bgColor?: string;
    borderRadius?: string;
    border?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export const IconButtonWithName: FC<Props> = memo((props) => {
    const {
        children,
        w,
        icon,
        bgColor="white",
        borderRadius,
        border,
        onClick,
        disabled
    } = props;
    
    const hoverStyle = {
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? undefined : (bgColor === "white" || 0.8),
        bgColor: disabled ? undefined : (bgColor === "white" && "#ddd"),
    };
    
    const activeStyle = {
        opacity: disabled ? undefined : (bgColor === "white" || 1.0),
        bgColor: disabled ? undefined : bgColor,
    }
    
    return (
        <Flex
            as="button"
            w={w}
            py="16px"
            px="16px"
            bgColor={disabled ? "gray.500" : bgColor}
            align="center"
            justify="space-between"
            borderRadius={borderRadius}
            border={border}
            onClick={disabled ? undefined : onClick}
            _hover={hoverStyle}
            _active={activeStyle}
        >
            { icon && (
                <Box className="side-icon" flexGrow={2} textAlign="center">
                    {icon}
                </Box>
            )}
            <Box
                flexGrow={icon ? 3 : 1}
                textAlign={icon ? "left" : "center"}>
                {children}
            </Box>
        </Flex>
    );
});
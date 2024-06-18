import {FC, memo, ReactNode, useCallback} from "react";
import {Box, Flex} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";

type Props = {
    children: ReactNode;
    w?: number | string;
    to?: string;
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
        to,
        icon,
        bgColor="white",
        borderRadius,
        border,
        onClick,
        disabled,
    } = props;
    
    const navigate = useNavigate();
    
    const handleClick = useCallback(() => {
        if (to) {
            navigate(to);
        }
        else if (onClick) {
            onClick();
        }
    }, [navigate, onClick, to]);
    
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
            onClick={disabled ? undefined : handleClick}
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
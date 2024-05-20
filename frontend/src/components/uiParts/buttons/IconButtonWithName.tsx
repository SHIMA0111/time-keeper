import {FC, memo, ReactNode} from "react";
import {Box, Flex} from "@chakra-ui/react";

type Props = {
    children: ReactNode;
    w?: number | string;
    icon?: ReactNode;
    bgColor?: string;
    borderRadius?: string;
    border?: string;
}

export const IconButtonWithName: FC<Props> = memo((props) => {
    const {
        children,
        w,
        icon,
        bgColor="white",
        borderRadius,
        border
    } = props;
    
    return (
        <Flex
            as="button"
            w={w}
            py="16px"
            px="16px"
            bgColor={bgColor}
            align="center"
            justify="space-between"
            borderRadius={borderRadius}
            border={border}
            _hover={{
                cursor: "pointer",
                opacity: bgColor === "white" || 0.8,
                bgColor: bgColor === "white" && "#ddd",
            }}
            _active={{
                opacity: bgColor === "white" || 1.0,
                bgColor: bgColor,
            }}
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
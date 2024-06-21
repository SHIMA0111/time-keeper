import {FC, memo} from "react";
import {Box, ResponsiveValue, ScaleFade} from "@chakra-ui/react";
import {GiHamburgerMenu} from "react-icons/gi";

type Props = {
    visible: boolean;
    hidden?: boolean;
    onClick?: () => void;
    top?: ResponsiveValue<number | string | "inherit" | "-moz-initial" | "initial" | "revert" | "revert-layer" | "unset" | "auto">;
    bottom?: ResponsiveValue<number | string | "inherit" | "-moz-initial" | "initial" | "revert" | "revert-layer" | "unset" | "auto">;
    right?: ResponsiveValue<number | string | "inherit" | "-moz-initial" | "initial" | "revert" | "revert-layer" | "unset" | "auto">;
    left?: ResponsiveValue<number | string | "inherit" | "-moz-initial" | "initial" | "revert" | "revert-layer" | "unset" | "auto">;
    size?: string | number;
}

export const FloatingMenuButton: FC<Props> = memo((props) => {
    const { visible,
        hidden = false,
        onClick,
        top,
        bottom,
        left,
        right,
        size } = props;
    return (
        <Box
            position="fixed"
            display={hidden ? "none" : undefined}
            top={top}
            bottom={bottom}
            left={left}
            right={right}
            _active={{
                shadow: "none"
            }}
        >
            <ScaleFade initialScale={0.9} in={visible}>
                <Box
                    as="button"
                    bgColor="#fff"
                    borderRadius="50%"
                    p="8px"
                    shadow="lg"
                    onClick={onClick}
                >
                    <GiHamburgerMenu size={size} />
                </Box>
            </ScaleFade>
        </Box>
    )
})
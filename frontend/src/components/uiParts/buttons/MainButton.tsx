import {FC, memo, ReactElement, ReactNode, useEffect} from "react";
import {Button, Tooltip} from "@chakra-ui/react";

type Props = {
    children: ReactNode;
    onClick: () => void;
    spinner?: ReactElement;
    isDisabled?: boolean;
    isLoading?: boolean;
    tooltipLabel?: string;
}

export const MainButton: FC<Props> = memo((props) => {
    const { children, spinner, onClick, isDisabled, isLoading, tooltipLabel } = props;
    useEffect(() => {
        const pushEnter = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !isDisabled) {
                onClick();
            }
        }
        
        document.addEventListener("keydown", pushEnter);
        
        return () => document.removeEventListener("keydown", pushEnter);
    }, [isDisabled, onClick]);
    
    return (
        <Tooltip label={tooltipLabel} openDelay={500}>
            <Button
                onClick={onClick}
                isDisabled={isDisabled}
                isLoading={isLoading}
                spinner={spinner}>{children}</Button>
        </Tooltip>
    )
});
import {FC, memo, ReactElement, ReactNode} from "react";
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
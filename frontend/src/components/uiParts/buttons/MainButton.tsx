import {FC, memo, ReactElement, ReactNode} from "react";
import {Button, Tooltip} from "@chakra-ui/react";
import {useEnterTrigger} from "../../../hooks/useEnterTrigger.ts";

type Props = {
    children: ReactNode;
    useEnterSubmit?: boolean;
    onClick?: () => void;
    spinner?: ReactElement;
    isDisabled?: boolean;
    isLoading?: boolean;
    tooltipLabel?: string;
}

export const MainButton: FC<Props> = memo((props) => {
    const { children, spinner, useEnterSubmit = false, onClick=() => {}, isDisabled=false, isLoading, tooltipLabel } = props;
    useEnterTrigger(useEnterSubmit, isDisabled, onClick);
    
    return (
        <Tooltip label={tooltipLabel} openDelay={500}>
            <Button
                colorScheme="blue"
                onClick={onClick}
                isDisabled={isDisabled}
                isLoading={isLoading}
                spinner={spinner}>{children}</Button>
        </Tooltip>
    )
});
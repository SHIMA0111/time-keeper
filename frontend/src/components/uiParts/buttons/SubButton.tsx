import {FC, memo, ReactElement, ReactNode} from "react";
import {Button} from "@chakra-ui/react";
import {useEnterTrigger} from "../../../hooks/useEnterTrigger.tsx";

type Props = {
    children: ReactNode;
    useEnterSubmit?: boolean;
    onClick?: () => void;
    spinner?: ReactElement;
    isDisabled?: boolean;
    isLoading?: boolean;
}

export const SubButton: FC<Props> = memo((props) => {
    const { children, spinner, useEnterSubmit = false, onClick=() => {}, isDisabled=false, isLoading } = props;
    useEnterTrigger(useEnterSubmit, isDisabled, onClick);
    
    return (
        <Button
            variant="outline"
            onClick={onClick}
            isDisabled={isDisabled}
            isLoading={isLoading}
            spinner={spinner}
        >{children}</Button>
    )
})
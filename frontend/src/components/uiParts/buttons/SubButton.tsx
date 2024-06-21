import {FC, memo, ReactElement, ReactNode, useEffect} from "react";
import {Button} from "@chakra-ui/react";

type Props = {
    children: ReactNode;
    onClick?: () => void;
    spinner?: ReactElement;
    isDisabled?: boolean;
    isLoading?: boolean;
}

export const SubButton: FC<Props> = memo((props) => {
    const { children, spinner, onClick, isDisabled, isLoading } = props;
    useEffect(() => {
        const pushEnter = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !isDisabled && onClick) {
                onClick();
            }
        }
        
        document.addEventListener("keydown", pushEnter);
        
        return () => document.removeEventListener("keydown", pushEnter);
    }, [isDisabled, onClick]);
    
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
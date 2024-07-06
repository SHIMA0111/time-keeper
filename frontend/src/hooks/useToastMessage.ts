import {useToast} from "@chakra-ui/react";
import {useCallback} from "react";

export type ToastProps = {
    title: string;
    description?: string;
    status: "success" | "error" | "warning" | "info";
}

export const useToastMessage = () => {
    const toast = useToast();
    
    const toastMessage = useCallback((props: ToastProps) => {
        const { title, description, status } = props;
        
        toast({
            title,
            description,
            status,
            duration: 3000,
            isClosable: true,
            position: "top",
        })
    }, [toast]);
    
    return { toastMessage };
}
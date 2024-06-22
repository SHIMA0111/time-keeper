import {useEffect, useState} from "react";

export const useCheckSecure = () => {
    const [isSecureConnection, setIsSecureConnection] = useState<boolean>(false);
    
    useEffect(() => {
        const protocol = location.protocol;
        const hostname = location.hostname;
        if (protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1") {
            setIsSecureConnection(true);
        }
        else {
            setIsSecureConnection(false);
        }
    }, []);
    
    return {isSecureConnection};
}
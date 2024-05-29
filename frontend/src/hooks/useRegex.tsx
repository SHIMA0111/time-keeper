import {useCallback, useState} from "react";

export const useRegex = (pattern: RegExp): [boolean, (regex_value: string) => void] => {
    const [isMatch, setIsMatch] = useState(true);

    const regex_match = useCallback((regex_value: string) => {
        setIsMatch(!!regex_value.match(pattern));
    }, [pattern]);

    return [isMatch, regex_match];
}
import {ChangeEvent, useState} from "react";

export const useInputChange = (): [string, (e: ChangeEvent<HTMLInputElement>) => void, () => void] => {
    const [inputValue, setInputValue] = useState("");
    
    const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    
    const cleanUp = () => {
        setInputValue("");
    }
    
    return [inputValue, inputChange, cleanUp];
}
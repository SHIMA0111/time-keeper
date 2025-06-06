import {ChangeEvent, Dispatch, SetStateAction, useState} from "react";

export const useInputChange = (defaultValue: string = ""): [string, (e: ChangeEvent<HTMLInputElement>) => void] => {
    const [inputValue, setInputValue] = useState(defaultValue);
    
    const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    
    return [inputValue, inputChange];
};

export const useInputChangeCleanUp = (defaultValue: string = ""): [string, (e: ChangeEvent<HTMLInputElement>) => void, () => void] => {
    const [inputValue, setInputValue] = useState(defaultValue);
    
    const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    
    const cleanUp = () => {
        setInputValue("");
    }
    
    return [inputValue, inputChange, cleanUp];
}

export const useInputChangeSetValue = (defaultValue: string = ""): [string, (e: ChangeEvent<HTMLInputElement>) => void, Dispatch<SetStateAction<string>>] => {
    const [inputValue, setInputValue] = useState(defaultValue);
    
    const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    
    return [inputValue, inputChange, setInputValue];
};

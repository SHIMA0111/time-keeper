import {useCallback} from "react";

const Day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const useTimestamp = () => {
    const convertEasyToReadTimestamp = useCallback((timestamp: Date) => {
        const year = timestamp.getFullYear();
        const month = timestamp.getMonth() + 1 < 10 ? `0${timestamp.getMonth() + 1}` : timestamp.getMonth() + 1;
        const date = timestamp.getDate() < 10 ? `0${timestamp.getDate()}` : timestamp.getDate();
        const hour = timestamp.getHours() < 10 ? `0${timestamp.getHours()}` : timestamp.getHours();
        const minutes = timestamp.getMinutes() < 10 ? `0${timestamp.getMinutes()}` : timestamp.getMinutes();
        const seconds = timestamp.getSeconds() < 10 ? `0${timestamp.getSeconds()}` : timestamp.getSeconds();
        const leadTimeFromUtc = Math.abs(timestamp.getTimezoneOffset());
        const leadHour = Math.floor(leadTimeFromUtc / 60) < 10 ? `0${Math.floor(leadTimeFromUtc / 60)}` : Math.floor(leadTimeFromUtc / 60);
        const remainMinutes = leadTimeFromUtc - Math.floor(leadTimeFromUtc / 60) * 60;
        const leadMinutes = remainMinutes < 10 ? `0${remainMinutes}` : remainMinutes;
        const timeDiff = `${leadHour}:${leadMinutes}:00`;
        const timezone = timestamp.getTimezoneOffset() < 0 ? `+${timeDiff}` : `-${timeDiff}`;


        return `${year}/${month}/${date}T${hour}:${minutes}:${seconds}${timezone}`;
    }, []);

    return {convertEasyToReadTimestamp};
}
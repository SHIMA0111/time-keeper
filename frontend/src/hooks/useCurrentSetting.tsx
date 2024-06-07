import {useEffect, useState} from "react";
import {Names} from "../types/api/categorySetting.ts";
import {useRecoilValue} from "recoil";
import {selectedCategoryState} from "../recoil/category/selectedCategoryState.ts";

export const useCurrentSetting = (information: Names[]) => {
    const [categoryKey, setCategoryKey] = useState<string[]>([]);
    const [isHaveInformation, setIsHaveInformation] = useState(false);
    const [informationValues, setInformationValues] = useState<Names[]>([]);
    
    const selectedCategory = useRecoilValue(selectedCategoryState);
    
    useEffect(() => {
        const values = (Object.values(information)).filter((val): val is Names => {
            return !(val === null);
        });
        setIsHaveInformation(!!information);
        setInformationValues(values);
        setCategoryKey(Object.keys(selectedCategory));
    }, [information, selectedCategory]);
    
    return {categoryKey, isHaveInformation, informationValues}
}
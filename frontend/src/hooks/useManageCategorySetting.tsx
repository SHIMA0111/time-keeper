import {useCallback, useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {selectedCategoryState} from "../recoil/category/selectedCategoryState.ts";
import {useInputChangeCleanUp} from "./useInputChange.tsx";
import {tempSelectedCategoryState} from "../recoil/category/tempSelectedCategoryState.ts";
import {AliasInput} from "../types/api/alias.ts";
import {useAuthedEndpoint} from "./useAuthedEndpoint.tsx";
import {useToastMessage} from "./useToastMessage.tsx";

export const useManageCategorySetting = (onClose: () => void) => {
    const [saveAlias, setSaveAlias] = useState(false);
    const [isSaveValid, setIsSaveValid] = useState(false);
    const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);
    const [tempSelectedCategory, setTempSelectedCategory] = useRecoilState(tempSelectedCategoryState);
    const [selectedCategoryKeyName, setSelectedCategoryKeyName] = useState<string[]>([]);
    const [aliasName, onChangeAliasName, aliasNameCleanup] = useInputChangeCleanUp();
   
    const axiosAuthedEndpoint = useAuthedEndpoint("http://localhost:8888/");
    const {toastMessage} = useToastMessage();
    
    
    useEffect(() => {
        const keys = Object.keys(selectedCategory);
        
        setSelectedCategoryKeyName(keys);
    }, [selectedCategory]);
    
    useEffect(() => {
        const mainCategory = selectedCategory.top;
        if (saveAlias) {
            setIsSaveValid(!!(mainCategory && aliasName));
        }
        else {
            setIsSaveValid(!!mainCategory);
        }
    }, [aliasName, saveAlias, selectedCategory.top]);
    
    const onClickSaveAlias = useCallback(() => {
        setSaveAlias(prevState => !prevState);
    }, []);
    
    const onClickAbort = useCallback(() => {
        setTempSelectedCategory(selectedCategory);
        onClose();
    }, [onClose, selectedCategory, setTempSelectedCategory]);
    
    const onClickSave = useCallback(() => {
        setSelectedCategory(tempSelectedCategory);
        if (localStorage.getItem("categorySetting")) {
            localStorage.removeItem("categorySetting");
        }
        localStorage.setItem("categorySetting", JSON.stringify(tempSelectedCategory));
        if (saveAlias) {
            const aliasInput: AliasInput = {
                alias_name: aliasName,
                top_id: selectedCategory.top.id,
                sub1_id: selectedCategory.sub1?.id,
                sub2_id: selectedCategory.sub2?.id,
                sub3_id: selectedCategory.sub3?.id,
                sub4_id: selectedCategory.sub4?.id,
            };
            axiosAuthedEndpoint.post("/create_alias", aliasInput)
                .then(res => {
                    if (res.data) {
                        toastMessage({
                            title: `Complete create alias: ${aliasName}`,
                            status: "success",
                        });
                        setSaveAlias(false);
                        aliasNameCleanup();
                        onClose();
                    }
                    else {
                        toastMessage({
                            title: "Failed to register alias",
                            status: "error"
                        });
                    }
                })
                .catch(err => {
                    const reason = err.response?.response?.data?.failed_reason;
                    const message = reason ? reason : "Failed to register alias by unexpected error";
                    
                    toastMessage({
                        title: "Failed to register alias",
                        description: message,
                        status: "error",
                    });
                })
        }
        else {
            onClose();
        }
    }, [setSelectedCategory, tempSelectedCategory, saveAlias, onClose, aliasName, selectedCategory, axiosAuthedEndpoint, toastMessage, aliasNameCleanup]);
    
    return {isSaveValid, selectedCategoryKeyName, onChangeAliasName, onClickSaveAlias, onClickSave, saveAlias, aliasName, onClickAbort};
}
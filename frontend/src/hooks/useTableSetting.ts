import {useCallback, useEffect, useState} from "react";
import {TableSetting} from "../types/api/tableSetting.ts";
import {useAuthedEndpoint} from "./useAuthedEndpoint.ts";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "./useToastMessage.ts";
import {categoriesData, CategoryData} from "../recoil/category/categoryData.ts";
import {useSetRecoilState} from "recoil";
import {HandleApiRequest} from "../utils/handleApiRequest.ts";

export const useTableSetting = () => {
    const [tableSettingInfo, setTableSettingInfo] = useState<TableSetting[]>([]);
    const [originalTableSetting, setOriginalTableSetting] = useState<TableSetting[]>([]);
    const setCategoryData = useSetRecoilState(categoriesData);
    const [isUpdated, setIsUpdated] = useState(false);
    const {toastMessage} = useToastMessage();
    const authedEndpoint = useAuthedEndpoint();
    
    useEffect(() => {
        const matchData = tableSettingInfo.map(table => {
            const originalTable = originalTableSetting.filter(original => {
                return original.table_name === table.table_name
            })[0];
            return table.display_name === originalTable.display_name && table.is_invalid === originalTable.is_invalid;
        });
        setIsUpdated(!matchData.every(match => match));
    }, [originalTableSetting, tableSettingInfo]);
    
    const setTableSetting = useCallback((newTableSetting: TableSetting) => {
        const newTables = tableSettingInfo.map(table => {
            if (table.table_name === newTableSetting.table_name) {
                return newTableSetting
            }
            else {
                return table
            }
        });
        newTables.sort((a, b) => a.table_name.localeCompare(b.table_name));
        setTableSettingInfo(newTables);
    }, [tableSettingInfo]);
    
    const initializeTableSetting = useCallback(async () => {
        await HandleApiRequest<TableSetting[]>(
            authedEndpoint.get<Response>("/table_setting"),
            "get table setting",
            (tableSettingData) => {
                if (!(tableSettingData.length === 5)) {
                    throw new Error("Backend response format is incompatible");
                }
                tableSettingData.sort(
                    (a, b) => a.table_name.localeCompare(b.table_name));
                setTableSettingInfo([...tableSettingData]);
                setOriginalTableSetting([...tableSettingData]);
            },
            false,
            toastMessage,
        );
    }, [authedEndpoint, toastMessage]);
    
    const saveEditing = useCallback(async () => {
        await HandleApiRequest<CategoryData[]>(
            authedEndpoint.post<Response>("/table_setting", tableSettingInfo),
            "save table setting",
            (newCategorySetting) => {
                setCategoryData(newCategorySetting);
                setOriginalTableSetting([...tableSettingInfo]);
            },
            true,
            toastMessage,
        );
    }, [authedEndpoint, setCategoryData, tableSettingInfo, toastMessage]);
    
    const cancelEditing = useCallback(() => {
        setTableSettingInfo(originalTableSetting);
    }, [originalTableSetting]);
    
    return {initializeTableSetting, tableSettingInfo, setTableSetting, saveEditing, cancelEditing, isUpdated};
}
import {useCallback, useEffect, useState} from "react";
import {TableSetting} from "../types/api/tableSetting.ts";
import {useAuthedEndpoint} from "./useAuthedEndpoint.tsx";
import {Response} from "../types/api/response.ts";
import {useToastMessage} from "./useToastMessage.tsx";
import {categoriesData, CategoryData} from "../recoil/category/categoryData.ts";
import {useSetRecoilState} from "recoil";

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
        newTables.sort((a, b) => {
            if (a.table_name < b.table_name) {
                return -1;
            }
            if (a.table_name > b.table_name) {
                return 1;
            }
            return 0;
        });
        setTableSettingInfo(newTables);
    }, [tableSettingInfo]);
    
    const initializeTableSetting = useCallback(() => {
        authedEndpoint.get<Response>("/table_setting")
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    const tableSetting: TableSetting[] = JSON.parse(resData.data);
                    if (!(tableSetting.length === 5)) {
                        toastMessage({
                            title: "Backend response format is incompatible",
                            description: "Please contact the developer",
                            status: "error"
                        });
                        return;
                    }
                    tableSetting.sort((a, b) => {
                        if (a.table_name < b.table_name) {
                            return -1;
                        }
                        if (a.table_name > b.table_name) {
                            return 1;
                        }
                        return 0;
                    });
                    setTableSettingInfo([...tableSetting]);
                    setOriginalTableSetting([...tableSetting]);
                }
                else {
                    toastMessage({
                        title: "Response invalid",
                        description: "Failed to access server. Please try later.",
                        status: "error"
                    })
                }
            })
            .catch(err => {
                const statusCode = err.response?.status;
                let errorReason = err.response?.data?.failed_reason;
                if (statusCode === 403) {
                    errorReason = "Authentication failed by token invalid";
                }
                toastMessage({
                    title: "Request failed",
                    description: errorReason || "Unexpected error occurred",
                    status: "error",
                })
            });
    }, [authedEndpoint, toastMessage]);
    
    const saveEditing = useCallback(() => {
        authedEndpoint.post<Response>("/table_setting", tableSettingInfo)
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    const categorySetting: CategoryData[] = JSON.parse(resData.data);
                    setCategoryData(categorySetting);
                    toastMessage({
                        title: "Save successful",
                        description: "Table setting saved successfully",
                        status: "success"
                    });
                    setOriginalTableSetting([...tableSettingInfo]);
                }
                else {
                    toastMessage({
                        title: "Save failed",
                        description: "Failed to save table setting. Please try again.",
                        status: "error"
                    });
                }
            })
            .catch(err => {
                const errorReason = err.response?.data?.failed_reason || "Unexpected error occurred";
                toastMessage({
                    title: "Save new table setting failed",
                    description: errorReason,
                    status: "error"
                });
            })
    }, [authedEndpoint, tableSettingInfo, toastMessage]);
    
    const cancelEditing = useCallback(() => {
        setTableSettingInfo(originalTableSetting);
    }, [originalTableSetting]);
    
    return {initializeTableSetting, tableSettingInfo, setTableSetting, saveEditing, cancelEditing, isUpdated};
}
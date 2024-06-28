import {FC, memo, useCallback, useEffect, useState} from "react";
import {Switch, Td, Tr} from "@chakra-ui/react";
import {EditableForm} from "../../../inputs/EditableForm.tsx";
import {TableSetting} from "../../../../../types/api/tableSetting.ts";

type Props = {
    table: TableSetting;
    parentTableEnable: boolean;
    childTableEnable: boolean;
    setTableSetting: (newTableSetting: TableSetting) => void;
}

export const TableSettingRow: FC<Props> = memo((props) => {
    const { table, parentTableEnable, childTableEnable, setTableSetting } = props;
    const [displayName, setDisplayName] = useState(table.display_name);
    const [isEnable, setIsEnable] = useState(!table.is_invalid);
    
    useEffect(() => {
        setDisplayName(table.display_name);
        setIsEnable(!table.is_invalid)
    }, [setIsEnable, table.display_name, table.is_invalid]);
    
    useEffect(() => {
        const newTableSetting: TableSetting = {
            ...table,
            display_name: displayName,
            is_invalid: !isEnable,
        };
        setTableSetting(newTableSetting);
    }, [displayName, isEnable]);
    
    const toggleIsEnable = useCallback(() => {
        setIsEnable(!isEnable);
    }, [isEnable]);
    
    return (
        <Tr>
            <Td>{table.table_name}</Td>
            <Td>
                <EditableForm
                    isDisplayLabel={false}
                    w="250px"
                    label={table.table_name}
                    value={displayName}
                    setFunction={setDisplayName} />
            </Td>
            <Td>
                <Switch
                    id={`${table.table_name}-switch`}
                    isDisabled={table.table_name === "main_category" || childTableEnable || !parentTableEnable}
                    isChecked={isEnable}
                    onChange={toggleIsEnable}
                />
            </Td>
        </Tr>
    )
})
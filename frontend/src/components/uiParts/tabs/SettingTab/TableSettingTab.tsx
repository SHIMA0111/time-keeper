import {FC, memo, useEffect} from "react";
import {
    Center,
    HStack, Table,
    TableContainer,
    TabPanel, Tbody, Th, Thead, Tr,
    VStack
} from "@chakra-ui/react";
import {useTableSetting} from "../../../../hooks/useTableSetting.ts";
import {TableSettingRow} from "./TableSettingTab/TableSettingRow.tsx";
import {MainButton} from "../../buttons/MainButton.tsx";
import {SubButton} from "../../buttons/SubButton.tsx";

export const TableSettingTab: FC = memo(() => {
    const {initializeTableSetting, tableSettingInfo, setTableSetting, saveEditing, cancelEditing, isUpdated} = useTableSetting();
    useEffect(() => {
        initializeTableSetting();
    }, [initializeTableSetting]);
    
    return (
        <TabPanel>
            <VStack spacing={4}>
                <TableContainer w="100%">
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>テーブル名</Th>
                                <Th>表示名</Th>
                                <Th>有効/無効</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {
                                tableSettingInfo.map((table, id) => {
                                    const parentTableEnable =
                                        id - 1 < 0 ? false : !tableSettingInfo[id - 1].is_invalid;
                                    const childTableEnable =
                                        tableSettingInfo.length === id + 1 ? false : !tableSettingInfo[id + 1].is_invalid;
                                    return (
                                        <TableSettingRow
                                            key={table.table_name}
                                            parentTableEnable={parentTableEnable}
                                            childTableEnable={childTableEnable}
                                            table={table}
                                            setTableSetting={setTableSetting} />
                                    )
                                })
                            }
                        </Tbody>
                    </Table>
                </TableContainer>
                <Center>
                    <HStack spacing={4}>
                        <MainButton
                            onClick={saveEditing}
                            isDisabled={!isUpdated}>Save</MainButton>
                        <SubButton
                            onClick={cancelEditing}>Cancel</SubButton>
                    </HStack>
                </Center>
            </VStack>
        </TabPanel>
    );
})
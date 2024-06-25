import {FC, memo, useEffect, useState} from "react";
import {
    Button,
    Center,
    HStack,
    Switch, Table,
    TableContainer,
    TabPanel, Tbody, Td, Th, Thead, Tr,
    VStack
} from "@chakra-ui/react";
import {EditableForm} from "../../inputs/EditableForm.tsx";
import {useAuthedEndpoint} from "../../../../hooks/useAuthedEndpoint.tsx";

export const TableSettingTab: FC = memo(() => {
    const [table1, setTable1] = useState("メインカテゴリ");
    const axiosAuthedEndpoint = useAuthedEndpoint();
    
    useEffect(() => {
        axiosAuthedEndpoint.get("/category_setting")
            .then(res => console.log(res))
            .catch(err => console.error(err))
    }, [axiosAuthedEndpoint]);
    
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
                            <Tr>
                                <Td>main_category</Td>
                                <Td>
                                    <EditableForm
                                        isDisplayLabel={false}
                                        w="250px"
                                        label="table1"
                                        value={table1}
                                        setFunction={setTable1} />
                                </Td>
                                <Td>
                                    <Switch
                                        id="table1-switch"
                                        isDisabled
                                        isChecked />
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>main_category</Td>
                                <Td>
                                    <EditableForm
                                        isDisplayLabel={false}
                                        w="250px"
                                        label="table1"
                                        value={table1}
                                        setFunction={setTable1} />
                                </Td>
                                <Td>
                                    <Switch
                                        id="table1-switch"
                                        isDisabled
                                        isChecked />
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>main_category</Td>
                                <Td>
                                    <EditableForm
                                        isDisplayLabel={false}
                                        w="250px"
                                        label="table1"
                                        value={table1}
                                        setFunction={setTable1} />
                                </Td>
                                <Td>
                                    <Switch
                                        id="table1-switch"
                                        isDisabled
                                        isChecked />
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>main_category</Td>
                                <Td>
                                    <EditableForm
                                        isDisplayLabel={false}
                                        w="250px"
                                        label="table1"
                                        value={table1}
                                        setFunction={setTable1} />
                                </Td>
                                <Td>
                                    <Switch
                                        id="table1-switch"
                                        isDisabled
                                        isChecked />
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>main_category</Td>
                                <Td>
                                    <EditableForm
                                        isDisplayLabel={false}
                                        w="250px"
                                        label="table1"
                                        value={table1}
                                        setFunction={setTable1} />
                                </Td>
                                <Td>
                                    <Switch
                                        id="table1-switch"
                                        isDisabled
                                        isChecked />
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
                <Center>
                    <HStack spacing={4}>
                        <Button colorScheme="teal">Save</Button>
                        <Button variant="outline">Cancel</Button>
                    </HStack>
                </Center>
            </VStack>
        </TabPanel>
    );
})
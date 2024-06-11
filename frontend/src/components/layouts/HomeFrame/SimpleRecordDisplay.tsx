import {FC, memo} from "react";
import {Box, Center, Table, TableContainer, Tbody, Th, Thead, Tr} from "@chakra-ui/react";
import {Names} from "../../../types/api/categorySetting.ts";

type Props = {
    categoryNames: Names[];
}

export const SimpleRecordDisplay: FC<Props> = memo((props) => {
    const { categoryNames } = props;
    
    return (
        <Box h="50%">
            <Center py="8px" fontSize="24px">CURRENT 100 RECORDS</Center>
            <TableContainer bgColor="white" mx="16px" boxSizing="border-box" h="85%" overflowY="auto" borderRadius="5px">
                <Table variant="simple">
                    <Thead position="sticky" top="0" bgColor="white">
                        <Tr>
                            <Th>Date</Th>
                            {
                                categoryNames.map(val => (
                                    <Th key={val.table_name}>{val.display_name}</Th>
                                ))
                            }
                            <Th isNumeric>Hours</Th>
                        </Tr>
                    </Thead>
                    {
                        [...Array(100)].map((_, index) => (
                            <Tbody key={index}>
                                <Tr>
                                    <Th>2024-01-01</Th>
                                    <Th>TOP</Th>
                                    <Th isNumeric>3.43</Th>
                                </Tr>
                            </Tbody>
                        ))
                    }
                </Table>
            </TableContainer>
        </Box>
    )
})
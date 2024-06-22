import {FC, memo} from "react";
import {Button, Center, HStack, TabPanel, VStack} from "@chakra-ui/react";
import {FormInput} from "../../inputs/FormInput.tsx";

export const CategorySettingTab: FC = memo(() => {
    return (
        <TabPanel>
            <VStack>
                <FormInput
                    label="カテゴリ日時"
                    value="2024/6/22T02:03:30"
                    readOnly
                />
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
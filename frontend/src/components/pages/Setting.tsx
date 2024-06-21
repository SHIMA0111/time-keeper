import {FC, memo, useCallback, useEffect} from "react";
import {HomeFlame} from "../flames/HomeFlame/HomeFlame.tsx";
import {
    Box,
    Button, Center, Flex,
    FormControl,
    FormLabel,
    HStack,
    Tab, TabList, TabPanel, TabPanels, Tabs,
    VStack
} from "@chakra-ui/react";
import {EditableInputWithButton} from "../uiParts/inputs/EditableInputWithButton.tsx";
import {useInputChange} from "../../hooks/useInputChange.tsx";
import {FormInput} from "../uiParts/inputs/FormInput.tsx";
import {MdOutlineCopyAll} from "react-icons/md";
import {MainButton} from "../uiParts/buttons/MainButton.tsx";
import {SubButton} from "../uiParts/buttons/SubButton.tsx";

export const Setting: FC = memo(() => {
    const [username, onChangeUsername] = useInputChange("Default Username");
    const [email, onChangeEmail] = useInputChange("Default Email");
    
    useEffect(() => {
        console.log(location.protocol);
        console.log(location.hostname);
    }, []);
    
    const onClickCopyClipboard = useCallback((value: string) => {
        navigator.clipboard.writeText(value)
            .then(() => {
                alert("Copy");
            })
            .catch(err => {
                console.error(err);
            })
    }, []);
    
    return (
        <HomeFlame>
            <Flex my={{base: "16px", md: "10%"}} align="center" justify="center">
                <Tabs
                    w={{ base: "85%", md: "70%", lg: "50%"}}
                    borderRadius="8px"
                    bgColor="#fff"
                    p="16px 24px">
                    <TabList>
                        <Tab>ユーザ設定</Tab>
                        <Tab>テーブル設定</Tab>
                        <Tab>カテゴリ設定</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Box>
                                <VStack spacing={4}>
                                    <FormInput
                                        label="User ID"
                                        value="debcc72a-789b-4046-b954-0825d3331861"
                                        cursor="not-allowed"
                                        readOnly
                                        rightIcon={{
                                            icon: <MdOutlineCopyAll />,
                                            onClick: () => onClickCopyClipboard("debcc72a-789b-4046-b954-0825d3331861")
                                        }} />
                                    <FormControl>
                                        <FormLabel>Username</FormLabel>
                                        <EditableInputWithButton aliaName="username" defaultValue={username} onChange={onChangeUsername} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Email</FormLabel>
                                        <EditableInputWithButton aliaName="email" defaultValue={email} onChange={onChangeEmail} />
                                    </FormControl>
                                    <FormInput
                                        label="登録日時"
                                        value="2024/6/22T02:03:30"
                                        cursor="not-allowed"
                                        readOnly
                                    />
                                    <Center>
                                        <HStack spacing={4}>
                                            <MainButton>Save</MainButton>
                                            <SubButton>Cancel</SubButton>
                                        </HStack>
                                    </Center>
                                </VStack>
                            </Box>
                        </TabPanel>
                        <TabPanel>
                            <VStack spacing={4}>
                                
                                <FormControl>
                                    <FormLabel>Email</FormLabel>
                                    <EditableInputWithButton aliaName="email" defaultValue={email} onChange={onChangeEmail} />
                                </FormControl>
                                <FormInput
                                    label="登録日時"
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
                        <TabPanel>
                            <VStack>
                                <FormControl>
                                    <FormLabel>Email</FormLabel>
                                    <EditableInputWithButton aliaName="email" defaultValue={email} onChange={onChangeEmail} />
                                </FormControl>
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
                    </TabPanels>
                </Tabs>
            </Flex>
        </HomeFlame>
    )
})
import {FC, memo} from "react";
import {Box, Center, FormControl, FormLabel, HStack, TabPanel, useClipboard, VStack} from "@chakra-ui/react";
import {FormInput} from "../../inputs/FormInput.tsx";
import {MdOutlineCopyAll} from "react-icons/md";
import {EditableForm} from "../../inputs/EditableForm.tsx";
import {EditableInputWithButton} from "../../inputs/EditableInputWithButton.tsx";
import {MainButton} from "../../buttons/MainButton.tsx";
import {SubButton} from "../../buttons/SubButton.tsx";
import {useInputChange} from "../../../../hooks/useInputChange.tsx";
import {useCheckSecure} from "../../../../hooks/useCheckSecure.tsx";
import {FaCheckCircle} from "react-icons/fa";
import {useRecoilValue} from "recoil";
import {userState} from "../../../../recoil/user/userState.ts";

export const UserSettingTab: FC = memo(() => {
    const userInfo = useRecoilValue(userState);
    
    const [username, onChangeUsername] = useInputChange(userInfo.username);
    const [email, onChangeEmail] = useInputChange(userInfo.email);
    const { onCopy, value, hasCopied} = useClipboard(userInfo.userId);
    const { isSecureConnection } = useCheckSecure();
    
    return (
        <TabPanel>
            <Box>
                <VStack spacing={4}>
                    <FormInput
                        label="User ID"
                        cursor="not-allowed"
                        value={value}
                        readOnly
                        rightIcon={ isSecureConnection ? {
                            icon: hasCopied ? <FaCheckCircle color="green" /> : <MdOutlineCopyAll />,
                            onClick: onCopy
                        } : undefined} />
                    <EditableForm label="ユーザ名" defaultValue={username} onChange={onChangeUsername} />
                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <EditableInputWithButton aliaName="email" defaultValue={email} onChange={onChangeEmail} />
                    </FormControl>
                    <FormInput
                        label="登録日時"
                        value={userInfo.createdDateTime}
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
    );
})
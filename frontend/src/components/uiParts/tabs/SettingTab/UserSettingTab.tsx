import {FC, memo, useCallback, useEffect, useState} from "react";
import {Box, Center, HStack, TabPanel, useClipboard, VStack} from "@chakra-ui/react";
import {FormInput} from "../../inputs/FormInput.tsx";
import {MdOutlineCopyAll} from "react-icons/md";
import {EditableForm} from "../../inputs/EditableForm.tsx";
import {MainButton} from "../../buttons/MainButton.tsx";
import {SubButton} from "../../buttons/SubButton.tsx";
import {useCheckSecure} from "../../../../hooks/useCheckSecure.tsx";
import {FaCheckCircle} from "react-icons/fa";
import {useRecoilValue} from "recoil";
import {userState} from "../../../../recoil/user/userState.ts";
import {useRegex} from "../../../../hooks/useRegex.tsx";
import {EmailPattern} from "../../../../types/regex.ts";

export const UserSettingTab: FC = memo(() => {
    const userInfo = useRecoilValue(userState);
    const [enableUpdate, setEnableUpdate] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const { onCopy, value, hasCopied} = useClipboard(userInfo.userId);
    const { isSecureConnection } = useCheckSecure();
    const [isValidEmail, validHandler] = useRegex(EmailPattern);
    
    useEffect(() => {
        setUsername(userInfo.username);
        setEmail(userInfo.email);
    }, [setEmail, setUsername, userInfo.email, userInfo.username]);
    
    useEffect(() => {
        validHandler(email);
    }, [email, validHandler]);
    
    useEffect(() => {
        if ((userInfo.username === username && userInfo.email === email) || !isValidEmail) {
            setEnableUpdate(false);
        }
        else {
            setEnableUpdate(true);
        }
    }, [email, isValidEmail, userInfo.email, userInfo.username, username]);
    
    const onClickCancelButton = useCallback(() => {
        setUsername(userInfo.username);
        setEmail(userInfo.email);
    }, [setEmail, setUsername, userInfo.email, userInfo.username])
    
    const onClickSaveButton = useCallback(() => {
        alert("Saved!!!");
    }, []);
    
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
                    <EditableForm label="ユーザ名" value={username} setFunction={setUsername} />
                    <EditableForm label="メールアドレス" value={email} setFunction={setEmail} />
                    <FormInput
                        label="登録日時"
                        value={userInfo.createdDateTime}
                        cursor="not-allowed"
                        readOnly
                    />
                    <Center>
                        <HStack spacing={4}>
                            <MainButton
                                isDisabled={!enableUpdate}
                                tooltipLabel={enableUpdate ? undefined :
                                    (isValidEmail ? "変更点がありません" : "メールアドレスの形式が正しくありません")}
                                onClick={onClickSaveButton}>Save</MainButton>
                            <SubButton
                                onClick={onClickCancelButton}>Cancel</SubButton>
                        </HStack>
                    </Center>
                </VStack>
            </Box>
        </TabPanel>
    );
})
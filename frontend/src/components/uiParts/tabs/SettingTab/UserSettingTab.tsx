import {FC, memo, useCallback, useEffect, useState} from "react";
import {Box, Center, HStack, TabPanel, useClipboard, VStack} from "@chakra-ui/react";
import {FormInput} from "../../inputs/FormInput.tsx";
import {MdOutlineCopyAll} from "react-icons/md";
import {EditableForm} from "../../inputs/EditableForm.tsx";
import {MainButton} from "../../buttons/MainButton.tsx";
import {SubButton} from "../../buttons/SubButton.tsx";
import {useCheckSecure} from "../../../../hooks/useCheckSecure.tsx";
import {FaCheckCircle} from "react-icons/fa";
import {useRecoilState} from "recoil";
import {userState, UserStateType} from "../../../../recoil/user/userState.ts";
import {useRegex} from "../../../../hooks/useRegex.tsx";
import {EmailPattern} from "../../../../types/regex.ts";
import {useAuthedEndpoint} from "../../../../hooks/useAuthedEndpoint.tsx";
import {UpdateUser} from "../../../../types/api/update/user.ts";
import {useToastMessage} from "../../../../hooks/useToastMessage.tsx";

export const UserSettingTab: FC = memo(() => {
    const [userInfo, setUserInfo] = useRecoilState(userState);
    const [enableUpdate, setEnableUpdate] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const { onCopy, value, hasCopied} = useClipboard(userInfo.userId);
    const { isSecureConnection } = useCheckSecure();
    const {toastMessage} = useToastMessage();
    const [isValidEmail, validHandler] = useRegex(EmailPattern);
    const axiosAuthedEndpoint = useAuthedEndpoint();
    
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
        if (userInfo.username === username && userInfo.email === email) return;
        const userUpdate: UpdateUser = {
            username,
            email,
        };
        axiosAuthedEndpoint.post("/update_user", userUpdate)
            .then(res => {
                if (!res.data) {
                    console.error("Update request was success but the response was invalid.");
                }
                const newUserData: UserStateType = {
                    ...userInfo,
                    username,
                    email,
                };
                setUserInfo(newUserData);
                const messageDetails =
                    userInfo.username === username ? `Update Email to email: ${email}` : (
                        userInfo.email === email ? `Update Username to username: ${username}` :
                            `Update User Information to username: ${username} and email: ${email}`);
                toastMessage({
                    status: "success",
                    title: "Update succeeded",
                    description: messageDetails,
                });
            })
            .catch(err => {
                const errorReason = err.response?.data?.failed_reason;
                toastMessage({
                    title: "Failed to update user data",
                    description: errorReason || "Unexpected error occurred",
                    status: "error",
                })
            })
    }, [axiosAuthedEndpoint, email, setUserInfo, toastMessage, userInfo, username]);
    
    return (
        <TabPanel>
            <Box>
                <VStack spacing={4}>
                    <FormInput
                        label="ユーザID"
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
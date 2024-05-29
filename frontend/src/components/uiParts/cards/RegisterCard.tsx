import {ChangeEvent, FC, memo, useCallback, useEffect, useState} from "react";
import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    Modal, ModalBody, ModalCloseButton,
    ModalContent, ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import {FormInput} from "../inputs/FormInput.tsx";
import {EmailIcon, LockIcon, ViewIcon, ViewOffIcon} from "@chakra-ui/icons";
import {BeatLoader} from "react-spinners";
import {useInputChange} from "../../../hooks/useInputChange.tsx";
import {useRegex} from "../../../hooks/useRegex.tsx";
import {FaKey, FaUser} from "react-icons/fa";
import {RegisterData, RegisterInput} from "../../../types/api/register.ts";
import axios from "axios";
import {Response} from "../../../types/api/response.ts";
import {useToastMessage} from "../../../hooks/useToastMessage.tsx";
import {EmailPattern} from "../../../types/regex.ts";

type Props = {
    toLogin: () => void,
}

export const RegisterCard: FC<Props> = memo((props) => {
    const { toLogin } = props;

    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isAllInput, setIsAllInput] = useState(false);
    const [isMatchPassword, setIsMatchPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");

    const [emailAddress, changeEmailAddress, cleanUpEmail] = useInputChange();
    const [password, changePassword, cleanUpPassword] = useInputChange();
    const [verifyPassword, changeVerifyPassword, cleanUpVerifyPassword] = useInputChange();

    const [isValidEmail, checkEmailValidation] = useRegex(EmailPattern);
    
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {toastMessage} = useToastMessage();

    const onClickShowPassword = useCallback(
        () => setIsShowPassword(!isShowPassword), [isShowPassword]);
    const defaultUsername = useCallback(() => {
        if (isValidEmail && username.trim().length === 0) {
            const defaultName = emailAddress.split("@");
            setUsername(defaultName[0]);
        }
    }, [emailAddress, isValidEmail, username]);


    useEffect(() => {
        if (emailAddress.length !== 0) {
            checkEmailValidation(emailAddress);
        }
    }, [checkEmailValidation, emailAddress]);
    
    useEffect(() => {
        if (isValidEmail && password.trim().length !== 0 && username.trim().length !== 0) {
            setIsAllInput(true);
        }
        else {
            setIsAllInput(false);
        }
    }, [isValidEmail, password, username]);
    
    useEffect(() => {
        if (password === verifyPassword && verifyPassword.trim().length !== 0) {
            setIsMatchPassword(true);
        }
        else {
            setIsMatchPassword(false);
        }
    }, [password, verifyPassword]);

    const onClickRegister = useCallback(() => {
        setLoading(true);
        const registerInput: RegisterInput = {
            username,
            user_email: emailAddress,
            password,
        };
        
        axios.post<Response>("http://localhost:8888/v1/general/register", registerInput)
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    if (!resData.request_success) {
                        const reason = resData.failed_reason || "any reason";
                        toastMessage({
                            title: "Register process failed",
                            description: `Register process failed by ${reason}. ` +
                                "\nPlease try later. " +
                                "\n If you face this error continuously, please contact the developer.",
                            status: "error"
                        });
                    }
                    const processResult: RegisterData = JSON.parse(resData.data);
                    if (processResult.register) {
                        toastMessage({
                            title: "Register completed",
                            description: "Register process completed." +
                                "\nPlease login the new account",
                            status: "success",
                        })
                        
                        cleanUpEmail();
                        cleanUpPassword();
                        cleanUpVerifyPassword();
                        setUsername("");
                        
                        toLogin();
                    }
                }
                else {
                    toastMessage({
                        title: "Register request failed",
                        description: "Request response doesn't have any response. \nPlease try later.",
                        status: "error",
                    })
                }
            })
            .catch(err => {
                const statusCode = err.response?.status;
                if (statusCode === 401) {
                    toastMessage({
                        title: "Register failed",
                        description: "Invalid email or password",
                        status: "error",
                    })
                }
                else {
                    toastMessage({
                        title: "Register request failed",
                        description: "An error occurred while processing your request. " +
                            "\nPlease try again later. " +
                            "\nIf you face this error continuously, please contact the developer.",
                        status: "error",
                    })
                }
            })
            .finally(() => setLoading(false));
    }, [cleanUpEmail, cleanUpPassword, cleanUpVerifyPassword, emailAddress, password, toLogin, toastMessage, username]);
    const onChangeUsername = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }, []);

    return (
        <>
            <Box borderWidth="1px" w={{ base: "sm", md: "md" }} p={4} borderRadius="lg" bgColor="#fff">
                <Heading as="h1" size="lg" textAlign="center">新規登録</Heading>
                <Divider mt={2} mb={4} />
                <Stack spacing="8px">
                    <FormInput
                        value={emailAddress}
                        onChange={changeEmailAddress}
                        onBlur={defaultUsername}
                        placeholder="メールアドレス"
                        errorMessage="有効なメールアドレスを入力してください。"
                        isValid={isValidEmail}
                        leftIcon={{
                            icon: <EmailIcon />
                        }}
                    />
                    <FormInput
                        value={password}
                        onChange={changePassword}
                        placeholder="パスワード"
                        type={isShowPassword ? "text" : "password"}
                        leftIcon={{
                            icon: <LockIcon />
                        }}
                        rightIcon={{
                            icon: isShowPassword ? <ViewOffIcon /> : <ViewIcon />,
                            onClick: onClickShowPassword
                        }}
                    />
                    <FormInput
                        value={username}
                        onChange={onChangeUsername}
                        placeholder="ユーザ名"
                        leftIcon={{
                            icon: <FaUser />
                        }}
                    />
                    <Button
                        isDisabled={!isAllInput}
                        onClick={onOpen}>確認</Button>
                </Stack>
                <Flex mt="16px" justify="right">
                    <Text
                        fontSize="small"
                        color="#00f"
                        cursor="pointer"
                        onClick={toLogin}
                        _hover={{
                            textDecoration: "underline"
                        }}>登録済みの方はこちら</Text>
                </Flex>
            </Box>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign="center">パスワード確認</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody mb="16px">
                        <Stack>
                            <FormInput
                                value={verifyPassword}
                                onChange={changeVerifyPassword}
                                type="password"
                                placeholder="パスワード確認"
                                isValid={isMatchPassword}
                                errorMessage="パスワードが一致しません。"
                                leftIcon={{
                                    icon: <FaKey />
                                }}
                            />
                            <Button
                                onClick={onClickRegister}
                                isDisabled={!isMatchPassword}
                                isLoading={loading}
                                spinner={<BeatLoader size={8} color="#333" />}>登録</Button>
                        </Stack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
});
import {FC, memo, useCallback, useEffect, useState} from "react";
import {Box, Button, Divider, Flex, Heading, Stack, Text} from "@chakra-ui/react";
import {FormInput} from "../inputs/FormInput.tsx";
import {EmailIcon, LockIcon, ViewIcon, ViewOffIcon} from "@chakra-ui/icons";
import {BeatLoader} from "react-spinners";
import {EmailPattern, LoginData, LoginInput, LoginResponse} from "../../../types/api/login.ts";
import {useInputChange} from "../../../hooks/useInputChange.tsx";
import init, {hash_from_str} from "wasm-tools";
import {useToastMessage} from "../../../hooks/useToastMessage.tsx";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {useRegex} from "../../../hooks/useRegex.tsx";

type Props = {
    toRegister: () => void,
}

export const LoginCard: FC<Props> = memo((props) => {
    const { toRegister } = props;
    
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
    const [hashedPassword, setHashedPassword] = useState("");
    
    const [emailAddress, changeEmailAddress, cleanUpEmail] = useInputChange();
    const [password, changePassword, cleanUpPassword] = useInputChange();

    const [isValidEmail, checkValidation] = useRegex(EmailPattern);
    
    const { toastMessage } = useToastMessage();
    
    useEffect(() => {
        init()
            .then(() => {
                const hashed_password = hash_from_str(password);
                setHashedPassword(hashed_password)
            })
    }, [password]);
    
    useEffect(() => {
        if (emailAddress.length !== 0) {
            checkValidation(emailAddress);
        }
    }, [checkValidation, emailAddress]);
    
    const onClickShowPassword = useCallback(
        () => setIsShowPassword(!isShowPassword), [isShowPassword]);
    
    const navigate = useNavigate();
    
    const onClickLogin = useCallback(() => {
        const loginInput: LoginInput = {
            user_email: emailAddress,
            password: hashedPassword,
        };
        
        axios.post<LoginResponse>("http://localhost:8888/v1/general/login", loginInput)
            .then(res => {
                if (res.data) {
                    const resData = res.data;
                    if (!resData.request_success) {
                        const reason = resData.failed_reason || "any reason";
                        toastMessage({
                            title: "Login process failed",
                            description: `Login process failed by ${reason}. ` +
                                "\nPlease try later. " +
                                "\n If you face this error continuously, please contact the developer.",
                            status: "error"
                        });
                    }
                    const processResult: LoginData = JSON.parse(resData.data);
                    if (processResult.authenticated) {
                        localStorage.setItem("refreshToken", processResult.refresh_token);
                        sessionStorage.setItem("actionKey", processResult.access_token)
                        
                        cleanUpEmail();
                        cleanUpPassword();
                        
                        navigate("/home");
                    }
                }
                else {
                    toastMessage({
                        title: "Login request failed",
                        description: "Request response doesn't have any response. \nPlease try later.",
                        status: "error",
                    })
                }
            })
            .catch(err => {
                const statusCode = err.response?.status;
                if (statusCode === 401) {
                    toastMessage({
                        title: "Login failed",
                        description: "Invalid email or password",
                        status: "error",
                    })
                }
                else {
                    toastMessage({
                        title: "Login request failed",
                        description: "An error occurred while processing your request. " +
                            "\nPlease try again later. " +
                            "\nIf you face this error continuously, please contact the developer.",
                        status: "error",
                    })
                }
            })
        
    }, [emailAddress, hashedPassword, navigate, toastMessage]);
    
    return (
        <Box borderWidth="1px" w={{ base: "sm", md: "md" }} p={4} borderRadius="lg" bgColor="#fff">
            <Heading as="h1" size="lg" textAlign="center">時間管理アプリ</Heading>
            <Divider mt={2} mb={4} />
            <Stack spacing="8px">
                <FormInput
                    value={emailAddress}
                    onChange={changeEmailAddress}
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
                <Button
                    isDisabled={!isValidEmail || emailAddress.length === 0 || password.length === 0}
                    isLoading={false}
                    onClick={onClickLogin}
                    spinner={<BeatLoader size={8} color="#333" />}
                >ログイン</Button>
            </Stack>
            <Flex mt="16px" justify="right">
                <Text
                    fontSize="small"
                    color="#00f"
                    cursor="pointer"
                    onClick={toRegister}
                    _hover={{
                        textDecoration: "underline"
                    }}>新規登録はこちら</Text>
            </Flex>
        </Box>
    )
})
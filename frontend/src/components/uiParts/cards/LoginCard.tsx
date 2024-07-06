import {FC, memo, useCallback, useEffect, useState} from "react";
import {Box, Divider, Flex, Heading, Stack, Text} from "@chakra-ui/react";
import {FormInput} from "../inputs/FormInput.tsx";
import {EmailIcon, LockIcon, ViewIcon, ViewOffIcon} from "@chakra-ui/icons";
import {BeatLoader} from "react-spinners";
import {useInputChange} from "../../../hooks/useInputChange.ts";
import init, {hash_from_str} from "wasm-tools";
import {useRegex} from "../../../hooks/useRegex.ts";
import {EmailPattern} from "../../../types/regex.ts";
import {useLogin} from "../../../hooks/useLogin.ts";
import {LoginInput} from "../../../types/api/login.ts";
import {useNavigate} from "react-router-dom";
import {MainButton} from "../buttons/MainButton.tsx";

export const LoginCard: FC = memo(() => {
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [hashedPassword, setHashedPassword] = useState("");
    const navigate = useNavigate();
    
    const [emailAddress, changeEmailAddress] = useInputChange();
    const [password, changePassword] = useInputChange();
    const [isValidEmail, checkValidation] = useRegex(EmailPattern);
    const { loading, loginAction } = useLogin();
    
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
    
    const onClickLogin = useCallback(() => {
        const loginInput: LoginInput = {
            user_email: emailAddress,
            password: hashedPassword,
        };
        
        loginAction(loginInput);
        
    }, [emailAddress, hashedPassword, loginAction]);
   
    const toRegister = useCallback(() => {
        navigate("/register");
    }, [navigate]);
    
    return (
        <Box borderWidth="1px" w={{ base: "sm", md: "md" }} p={4} borderRadius="lg" bgColor="#fff">
            <Heading as="h1" size="lg" textAlign="center">ログイン</Heading>
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
                <MainButton
                    useEnterSubmit
                    tooltipLabel={isValidEmail && password.length !== 0 ?
                        "" : (isValidEmail && emailAddress.length !== 0 ? "パスワードを入力してください" : "正しいメールアドレスを入力してください")}
                    isDisabled={!isValidEmail || emailAddress.length === 0 || password.length === 0}
                    isLoading={loading}
                    onClick={onClickLogin}
                    spinner={<BeatLoader size={8} color="#333" />}
                >ログイン</MainButton>
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
import {ChangeEvent, FC, memo, useCallback, useEffect, useState} from "react";
import {
    Box,
    Divider,
    Flex,
    Heading,
    Stack,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import {FormInput} from "../inputs/FormInput.tsx";
import {EmailIcon, LockIcon, ViewIcon, ViewOffIcon} from "@chakra-ui/icons";
import {useInputChange} from "../../../hooks/useInputChange.ts";
import {useRegex} from "../../../hooks/useRegex.ts";
import {FaUser} from "react-icons/fa";
import {EmailPattern} from "../../../types/regex.ts";
import {MainButton} from "../buttons/MainButton.tsx";
import {RegisterModal} from "../modals/RegisterModal.tsx";
import {useNavigate} from "react-router-dom";

export const RegisterCard: FC = memo(() => {
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isAllInput, setIsAllInput] = useState(false);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const [emailAddress, changeEmailAddress] = useInputChange();
    const [password, changePassword] = useInputChange();
    const [isValidEmail, checkEmailValidation] = useRegex(EmailPattern);
    
    const {isOpen, onOpen, onClose} = useDisclosure();

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
    
    const onChangeUsername = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }, []);
    
    const toLogin = useCallback(() => {
        navigate("/");
    }, [navigate]);
    

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
                    <MainButton
                        isDisabled={!isAllInput}
                        tooltipLabel={isAllInput ?
                            undefined :
                            (isValidEmail ? "全ての項目を入力してください" : "Emailアドレスが正しくありません")}
                        onClick={onOpen}>確認</MainButton>
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
            <RegisterModal
                isOpen={isOpen}
                onClose={onClose}
                password={password}
                username={username}
                email={emailAddress} />
        </>
    );
});
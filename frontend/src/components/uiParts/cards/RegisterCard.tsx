import {FC, memo, useCallback, useEffect, useState} from "react";
import {Box, Button, Divider, Flex, Heading, Stack, Text} from "@chakra-ui/react";
import {FormInput} from "../inputs/FormInput.tsx";
import {EmailIcon, LockIcon, ViewIcon, ViewOffIcon} from "@chakra-ui/icons";
import {BeatLoader} from "react-spinners";
import {useInputChange} from "../../../hooks/useInputChange.tsx";
import {useRegex} from "../../../hooks/useRegex.tsx";
import {EmailPattern} from "../../../types/api/login.ts";

type Props = {
    toLogin: () => void,
}

export const RegisterCard: FC<Props> = memo((props) => {
    const { toLogin } = props;

    const [isShowPassword, setIsShowPassword] = useState<boolean>(false);

    const [emailAddress, changeEmailAddress, cleanUpEmail] = useInputChange();
    const [password, changePassword, cleanUpPassword] = useInputChange();

    const [isValidEmail, checkEmailValidation] = useRegex(EmailPattern);

    const onClickShowPassword = useCallback(
        () => setIsShowPassword(!isShowPassword), [isShowPassword]);


    useEffect(() => {
        if (emailAddress.length !== 0) {
            checkEmailValidation(emailAddress);
        }
    }, [checkEmailValidation, emailAddress]);

    const onClickRegister = () => {
        cleanUpEmail();
        cleanUpPassword();
        alert("登録!");
    }

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
                    onClick={onClickRegister}
                    spinner={<BeatLoader size={8} color="#333" />}
                >ログイン</Button>
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
    );
});
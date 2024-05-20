import {ChangeEvent, FC, memo, useState} from "react";
import {Box, Button, Divider, Flex, Heading, Stack} from "@chakra-ui/react";
import {EmailIcon, LockIcon, ViewIcon, ViewOffIcon} from "@chakra-ui/icons";
import {BeatLoader} from "react-spinners";
import {useAuthentication} from "../../hooks/useAuthentication.tsx";
import {FormInput} from "../uiParts/inputs/FormInput.tsx";
import {EmailPattern} from "../../types/api/login.ts";

export const Login: FC = memo(() => {
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
    const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
    const [mailValue, setMailValue] = useState<string>("");
    const [passwordValue, setPasswordValue] = useState<string>("");
    
    const { isLoading, loginCall } = useAuthentication();
    
    const onClickShowPassword = () => setIsShowPassword(!isShowPassword);
    const onChangeMail = (e: ChangeEvent<HTMLInputElement>) => {
        const current_mail = e.target.value;
        
        setIsValidEmail(!!current_mail.match(EmailPattern));
        setMailValue(current_mail);
    }
    const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => setPasswordValue(e.target.value);
    
    
    return (
        <Flex align="flex-start" justify="center" marginTop="30vh">
            <Box borderWidth="1px" w={{ base: "sm", md: "md" }} p={4} borderRadius="lg" bgColor="#fff">
                <Heading as="h1" size="lg" textAlign="center">時間管理アプリ</Heading>
                <Divider mt={2} mb={4} />
                <Stack spacing="8px">
                    <FormInput
                        value={mailValue}
                        onChange={onChangeMail}
                        placeholder="メールアドレス"
                        errorMessage="有効なメールアドレスを入力してください。"
                        isValid={isValidEmail}
                        leftIcon={{
                            icon: <EmailIcon />
                        }}
                    />
                    <FormInput
                        value={passwordValue}
                        onChange={onChangePassword}
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
                        isDisabled={!isValidEmail || mailValue.length === 0 || passwordValue.length === 0}
                        isLoading={isLoading}
                        onClick={() => loginCall(mailValue, passwordValue)}
                        spinner={<BeatLoader size={8} color="#333" />}
                    >ログイン</Button>
                </Stack>
            </Box>
        </Flex>
    );
})
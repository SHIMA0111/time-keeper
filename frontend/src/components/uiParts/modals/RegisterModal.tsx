import {FC, memo, useCallback, useEffect, useState} from "react";
import {Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack} from "@chakra-ui/react";
import {FormInput} from "../inputs/FormInput.tsx";
import {FaKey} from "react-icons/fa";
import {MainButton} from "../buttons/MainButton.tsx";
import {BeatLoader} from "react-spinners";
import {RegisterInput} from "../../../types/api/register.ts";
import {useRegister} from "../../../hooks/useRegister.tsx";
import {useInputChangeCleanUp} from "../../../hooks/useInputChange.tsx";
import init, {hash_from_str} from "wasm-tools";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    password: string;
    username: string;
    email: string;
};

export const RegisterModal: FC<Props> = memo((props) => {
    const {isOpen, onClose, password, username, email} = props;
    
    const [isMatchPassword, setIsMatchPassword] = useState(false);
    const [hashedPassword, setHashedPassword] = useState("");
    const [verifyPassword, changeVerifyPassword, cleanUpVerifyPassword] = useInputChangeCleanUp();
    const { loading, registerAction } = useRegister();
    
    useEffect(() => {
        if (password === verifyPassword && verifyPassword.trim().length !== 0) {
            setIsMatchPassword(true);
        }
        else {
            setIsMatchPassword(false);
        }
    }, [password, verifyPassword]);
    useEffect(() => {
        init()
            .then(() => {
                const hashed_password = hash_from_str(password);
                setHashedPassword(hashed_password)
            })
    }, [password]);
    
    const onCloseCustom = useCallback(() => {
        cleanUpVerifyPassword();
        onClose();
    }, [cleanUpVerifyPassword, onClose]);
    
    
    const onClickRegister = useCallback(() => {
        const registerInput: RegisterInput = {
            username,
            email: email,
            password: hashedPassword,
        };
        registerAction(registerInput);
    }, [email, hashedPassword, registerAction, username]);
    
    return (
        <Modal isOpen={isOpen} onClose={onCloseCustom} closeOnOverlayClick={false}>
            <ModalOverlay />
            <ModalContent mt="15%">
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
                        <MainButton
                            onClick={onClickRegister}
                            tooltipLabel={ isMatchPassword ? undefined : "確認のため、再度パスワードを入力してください" }
                            isDisabled={!isMatchPassword}
                            isLoading={loading}
                            spinner={<BeatLoader size={8} color="#333" />}>登録</MainButton>
                    </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
});
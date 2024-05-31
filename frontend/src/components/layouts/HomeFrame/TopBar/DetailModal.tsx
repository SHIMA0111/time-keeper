import {FC, memo} from "react";
import {
    Center,
    FormControl,
    FormLabel, Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, Stack
} from "@chakra-ui/react";
import {NoShadowSelect} from "../../../uiParts/inputs/NoShadowSelect.tsx";
import {IconButtonWithName} from "../../../uiParts/buttons/IconButtonWithName.tsx";
import {MdSaveAlt} from "react-icons/md";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    formContentNames: string[];
}

export const DetailModal: FC<Props> = memo((props) => {
    const { isOpen, onClose, formContentNames } = props;

    return(
        <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Center>カテゴリ設定</Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing={4}>
                        {
                            formContentNames.map(name => (
                                <FormControl key={name}>
                                    <FormLabel>{name}:</FormLabel>
                                    <NoShadowSelect placeholder={`${name}を選択`}></NoShadowSelect>
                                </FormControl>
                            ))
                        }
                    </Stack>
                    <ModalFooter px={0}>
                        <IconButtonWithName
                            borderRadius="4px"
                            border="1px solid #eee"
                            onClick={() => alert("保存")}
                            icon={<MdSaveAlt />}>保存</IconButtonWithName>
                    </ModalFooter>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
});
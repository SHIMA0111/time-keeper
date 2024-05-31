import {FC, memo} from "react";
import {
    FormControl,
    FormLabel, Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay
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
                <ModalHeader>詳細設定</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {
                        formContentNames.map(name => (
                            <FormControl key={name}>
                                <FormLabel>{name}:</FormLabel>
                                <NoShadowSelect placeholder={`${name}を選択`}></NoShadowSelect>
                            </FormControl>
                        ))
                    }
                    <ModalFooter px={0}>
                        <IconButtonWithName
                            borderRadius="4px"
                            border="1px solid #eee"
                            icon={<MdSaveAlt />}>保存</IconButtonWithName>
                    </ModalFooter>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
});
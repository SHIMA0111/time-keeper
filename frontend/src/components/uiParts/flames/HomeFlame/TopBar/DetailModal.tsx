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
import {NoShadowSelect} from "../../../inputs/NoShadowSelect.tsx";
import {IconButtonWithName} from "../../../buttons/IconButtonWithName.tsx";
import {MdSaveAlt} from "react-icons/md";
import {useRecoilValue} from "recoil";
import {categoriesData} from "../../../../../recoil/category/categoryData.ts";

type Props = {
    isOpen: boolean;
    onClose: () => void;
}

export const DetailModal: FC<Props> = memo((props) => {
    const { isOpen, onClose } = props;
    const categories = useRecoilValue(categoriesData);
    
    return(
        <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>詳細設定</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {
                        categories.map(category => (
                            <FormControl key={category.table_name}>
                                <FormLabel>{category.display_name}</FormLabel>
                                <NoShadowSelect placeholder={`${category.display_name}を選択`}>
                                    {category.categories.map(categoryDetail => (
                                        <option key={categoryDetail.id} value={categoryDetail.id}>
                                            {categoryDetail.name}
                                        </option>
                                    ))}
                                </NoShadowSelect>
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
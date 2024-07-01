import {FC, memo} from "react";
import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay
} from "@chakra-ui/react";
import {IconButtonWithName} from "../../../buttons/IconButtonWithName.tsx";
import {MdSaveAlt} from "react-icons/md";
import {useRecoilValue} from "recoil";
import {categoriesData} from "../../../../../recoil/category/categoryData.ts";
import {ModalForm} from "./DetailModal/ModalForm.tsx";
import {useGlobalSelectedCategory} from "../../../../../hooks/useGlobalSelectedCategory.tsx";
import {SelectedCategoryType} from "../../../../../recoil/category/selectedCategoryData.ts";

type Props = {
    isOpen: boolean;
    onClose: () => void;
}

export const DetailModal: FC<Props> = memo((props) => {
    const { isOpen, onClose } = props;
    const categories = useRecoilValue(categoriesData);
    const { tmpSelectedCategory, addSelectedCategory } = useGlobalSelectedCategory();
    
    return(
        <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>詳細設定</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {
                        categories.map(category => {
                            const tableName = category.table_name as keyof SelectedCategoryType;
                            const selectedCategory = tmpSelectedCategory[tableName];
                            if (typeof selectedCategory === "string") return;
                            return (
                                <ModalForm key={category.table_name}
                                           category={category}
                                           value={selectedCategory?.id}
                                           setSelectedCategory={addSelectedCategory}/>
                            );
                        })
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
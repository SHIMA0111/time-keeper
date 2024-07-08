import {FC, memo} from "react";
import {
    Checkbox,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, Stack
} from "@chakra-ui/react";
import {IconButtonWithName} from "../../../buttons/IconButtonWithName.tsx";
import {MdSaveAlt} from "react-icons/md";
import {useRecoilValue} from "recoil";
import {categoriesData} from "../../../../../recoil/category/categoryData.ts";
import {ModalForm} from "./DetailModal/ModalForm.tsx";
import {useGlobalSelectedCategory} from "../../../../../hooks/useGlobalSelectedCategory.ts";
import {SelectedCategoryType} from "../../../../../recoil/category/selectedCategoryData.ts";
import {FormInput} from "../../../inputs/FormInput.tsx";

type Props = {
    isOpen: boolean;
    onClose: () => void;
}

export const DetailModal: FC<Props> = memo((props) => {
    const { isOpen, onClose } = props;
    const categories = useRecoilValue(categoriesData);
    const {
        tmpSelectedCategory,
        addSelectedCategory,
        superiorIdGetter,
        onSave,
        isSaveAlias,
        onToggleIsSave,
        aliasName,
        onChangeAliasName
    } = useGlobalSelectedCategory();
    
    return(
        <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>詳細設定</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack>
                        {
                            categories.map(category => {
                                const tableName = category.table_name as keyof SelectedCategoryType;
                                const selectedCategory = tmpSelectedCategory[tableName];
                                const superiorId = superiorIdGetter(category.table_name);
                                if (typeof selectedCategory === "string") return;
                                return (
                                    <ModalForm key={category.table_name}
                                               superiorSelectedId={superiorId}
                                               category={category}
                                               value={selectedCategory?.id}
                                               setSelectedCategory={addSelectedCategory}/>
                                );
                            })
                        }
                        <Checkbox onChange={onToggleIsSave}>設定をエイリアスとして登録しますか？</Checkbox>
                        {
                            isSaveAlias && <FormInput label="エイリアス名" value={aliasName} onChange={onChangeAliasName} />
                        }
                    </Stack>
                    <ModalFooter px={0}>
                        <IconButtonWithName
                            borderRadius="4px"
                            border="1px solid #eee"
                            onClick={onSave}
                            icon={<MdSaveAlt />}>保存</IconButtonWithName>
                    </ModalFooter>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
});
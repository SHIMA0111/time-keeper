import {FC, memo} from "react";
import {
    Center, Checkbox,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, Spacer, Stack
} from "@chakra-ui/react";
import {IconButtonWithName} from "../../../uiParts/buttons/IconButtonWithName.tsx";
import {MdDriveFileRenameOutline, MdSaveAlt} from "react-icons/md";
import {Names} from "../../../../types/api/categorySetting.ts";
import {FormInput} from "../../../uiParts/inputs/FormInput.tsx";
import {CategorySelectForm} from "./DetailModal/CategorySelectForm.tsx";
import {useManageCategorySetting} from "../../../../hooks/useManageCategorySetting.tsx";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    formContentNames: Names[];
}

export const DetailModal: FC<Props> = memo((props) => {
    const { isOpen, onClose, formContentNames } = props;
    const {
        onChangeAliasName,
        onClickSaveAlias,
        onClickSave,
        saveAlias,
        aliasName,
        selectedCategoryKeyName,
        onClickAbort,
        isSaveValid } = useManageCategorySetting(onClose);
    
    return(
        <Modal isOpen={isOpen} onClose={onClickAbort} autoFocus={false}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Center>カテゴリ設定</Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing={4}>
                        {
                            formContentNames.map((name, i) => (
                                <CategorySelectForm
                                    key={name.table_name}
                                    name={name}
                                    keyName={selectedCategoryKeyName[i]}
                                    superiorKeyName={ i ? selectedCategoryKeyName[i - 1] : undefined}
                                    childrenKeys={selectedCategoryKeyName.slice(i + 1)}/>
                            ))
                        }
                        <Spacer />
                        <Checkbox isChecked={saveAlias} onChange={onClickSaveAlias}>
                            現在のカテゴリをエイリアスとして保存しますか？
                        </Checkbox>
                        {
                            saveAlias ?
                                <FormInput
                                    placeholder="エイリアス名を入力してください"
                                    isValid={!!aliasName.length}
                                    errorMessage="エイリアス名を必ず入力してください"
                                    value={aliasName}
                                    onChange={onChangeAliasName}
                                    leftIcon={{icon: <MdDriveFileRenameOutline />}} /> : undefined
                        }
                    </Stack>
                    <ModalFooter px={0}>
                        <IconButtonWithName
                            borderRadius="4px"
                            border="1px solid #eee"
                            onClick={onClickSave}
                            disabled={!isSaveValid}
                            icon={<MdSaveAlt />}>保存</IconButtonWithName>
                    </ModalFooter>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
});
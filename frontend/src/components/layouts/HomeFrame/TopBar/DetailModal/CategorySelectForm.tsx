import {ChangeEvent, FC, memo, useCallback, useEffect, useState} from "react";
import {FormControl, FormLabel} from "@chakra-ui/react";
import {NoShadowSelect} from "../../../../uiParts/inputs/NoShadowSelect.tsx";
import {CategoryOptionGeneration} from "../../../../uiParts/inputs/CategoryOptionGeneration.tsx";
import {Names} from "../../../../../types/api/categorySetting.ts";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    CategoryPair,
    SelectedCategoryType
} from "../../../../../recoil/category/selectedCategoryState.ts";
import {allCategoryState, AllCategoryType} from "../../../../../recoil/category/allCategoryState.ts";
import {tempSelectedCategoryState} from "../../../../../recoil/category/tempSelectedCategoryState.ts";

type Props = {
    name: Names;
    keyName: string;
    superiorKeyName?: string;
    childrenKeys: string[];
};

export const CategorySelectForm: FC<Props> = memo((props) => {
    const {name, keyName, superiorKeyName, childrenKeys} = props;
    const [tempSelectedCategory, setTempSelectedCategory] = useRecoilState(tempSelectedCategoryState);
    const [selectedValue, setSelectedValue] = useState(-99);
    const allCategory = useRecoilValue(allCategoryState);
    
    useEffect(() => {
        const currentKeyCategory = tempSelectedCategory[keyName as keyof SelectedCategoryType];
        let id;
        if (!currentKeyCategory) {
            id = -99
        }
        else {
            id = currentKeyCategory.id;
        }
        setSelectedValue(id);
    }, [keyName, tempSelectedCategory]);
    
    const onChangeSelectedCategory = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const res = allCategory[keyName as keyof AllCategoryType].filter(categoryInfo => {
            return e.target.value == String(categoryInfo.id)
        });
        let name;
        if (res.length === 0) {
            name = "";
        }
        else {
            name = res[0].name;
        }
        const newSelectedValue: CategoryPair = {
            id: Number(e.target.value),
            name: name
        }
        setTempSelectedCategory(oldState => ({
            ...oldState,
            [keyName]: newSelectedValue,
        }));
        childrenKeys.map(key => {
            setTempSelectedCategory(oldState => ({
                ...oldState,
                [key]: null,
            }));
        });
    }, [allCategory, childrenKeys, keyName, setTempSelectedCategory]);
    
    return (
        <FormControl key={name.display_name}>
            <FormLabel>{name.display_name}:</FormLabel>
            <NoShadowSelect onChange={onChangeSelectedCategory} placeholder={`${name.display_name}を選択`} value={String(selectedValue)}>
                <CategoryOptionGeneration
                    categoryTableName={name.table_name}
                    superiorKeyName={superiorKeyName}
                    keyName={keyName} />
            </NoShadowSelect>
        </FormControl>
    );
});
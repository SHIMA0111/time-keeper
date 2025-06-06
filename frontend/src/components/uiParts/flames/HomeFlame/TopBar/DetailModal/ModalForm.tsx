import {ChangeEvent, FC, memo, useCallback} from "react";
import {FormControl, FormLabel} from "@chakra-ui/react";
import {NoShadowSelect} from "../../../../inputs/NoShadowSelect.tsx";
import {CategoryContent, CategoryData} from "../../../../../../recoil/category/categoryData.ts";

type Props = {
    superiorSelectedId: string | undefined;
    category: CategoryData;
    value?: string;
    setSelectedCategory: (table_name: string, categoryContent: CategoryContent | undefined) => void;
}

export const ModalForm: FC<Props> = memo((props) => {
    const {
        superiorSelectedId,
        category,
        value="",
        setSelectedCategory} = props;

    const onChangeSelectedCategory = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const table_name = category.table_name;
        const selectedCategoryList = category.categories.filter(category => {
            return category.id === e.target.value;
        });
        const selectedCategory = selectedCategoryList.length > 0 ? selectedCategoryList[0] : undefined;
        setSelectedCategory(table_name, selectedCategory);
    }, [category.categories, category.table_name, setSelectedCategory]);

    return (
        <FormControl key={category.table_name}>
            <FormLabel>{category.display_name}</FormLabel>
            <NoShadowSelect
                placeholder={`${category.display_name}を選択`}
                value={value}
                onChange={onChangeSelectedCategory}
            >
                {category.categories
                    .filter(category => {
                        if (!category.superior_id) return true;
                        if (!superiorSelectedId) return true;
                        return category.superior_id === superiorSelectedId
                    })
                    .map(categoryDetail => (
                    <option key={categoryDetail.id} value={categoryDetail.id}>
                        {categoryDetail.name}
                    </option>
                ))}
            </NoShadowSelect>
        </FormControl>
    );
})
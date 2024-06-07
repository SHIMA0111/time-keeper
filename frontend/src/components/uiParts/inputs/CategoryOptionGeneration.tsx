import {FC, memo} from "react";
import {useCategoryItems} from "../../../hooks/useCategoryItems.tsx";

export type ItemsProps = {
    categoryTableName: string;
    superiorKeyName?: string;
    keyName: string;
}

export const CategoryOptionGeneration: FC<ItemsProps> = memo((props) => {
    const {categoryOptions} = useCategoryItems(props);
    
    return (
        <>
            {
                categoryOptions && categoryOptions.map(data => (
                    <option key={data.id} value={data.id}>
                        {data.name}
                    </option>
                ))
            }
        </>
    );
})
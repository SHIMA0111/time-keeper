import {FC, memo} from "react";
import {Box} from "@chakra-ui/react";

type Props = {
    onClick: () => void;
}

export const AddButton: FC<Props> = memo((props) => {
    const {onClick} = props;
    
    return (
        <Box
            as="button"
            mt="8px"
            w="100%"
            border="1px dashed #ccc"
            color="#333"
            textAlign="center"
            borderRadius="4px"
            onClick={onClick}
            cursor="pointer"
            _hover={{
               border: "1px solid #ccc",
            }}>
            +
        </Box>
);
});
import {FC, memo} from "react";
import {Box, Image} from "@chakra-ui/react";
import {BeatLoader} from "react-spinners";

type Props = {
    src: string;
}

export const Logo: FC<Props> = memo((props) => {
    const { src } = props;
    
    return (
        <Box as="header" h="8%" userSelect="none" textAlign="center" alignContent="center" pointerEvents="none">
            <Image
                w="100%"
                h="100%"
                src={src}
                fallback={<BeatLoader size={6} />}
                objectFit="cover" />
        </Box>
    )
});
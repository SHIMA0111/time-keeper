import {FC, memo, ReactNode} from "react";
import {motion} from "framer-motion";
import {Box, Flex} from "@chakra-ui/react";

const Word: FC<{children: ReactNode, id: number}> = ({children, id}) => (
    <motion.div
        animate={{
            y: [
                "0",
                "-50%",
                "0"
            ],
        }}
        transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
            delay: id * 0.3
        }}
        style={{
            fontSize: "36px",
            fontWeight: "bold"
        }}
    >
        {children}
    </motion.div>
)

export const Loading: FC = memo(() => {
    
    const loadingText = "NowLoading...".split("");
    
    return (
        <Box w="100%" h="100vh">
            <Box position="absolute" right="8px" bottom="0px">
                <Flex>
                    {loadingText.map((char, i) => (
                        <Word key={char + i} id={i}>{char}</Word>
                    ))}
                </Flex>
            </Box>
        </Box>
    )
});
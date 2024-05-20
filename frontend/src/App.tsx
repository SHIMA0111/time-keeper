import {BrowserRouter} from "react-router-dom";
import {RootRouter} from "./routers/RootRouter.tsx";
import {ChakraProvider} from "@chakra-ui/react";
import {theme} from "./theme/theme.ts";

const App = () => {
    return (
        <ChakraProvider theme={theme}>
            <BrowserRouter>
                <RootRouter />
            </BrowserRouter>
        </ChakraProvider>
    )
}

export default App

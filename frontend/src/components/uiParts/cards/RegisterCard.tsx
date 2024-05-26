import {FC, memo} from "react";

type Props = {
    toLogin: () => void,
}

export const RegisterCard: FC<Props> = memo((props) => {
    const { toLogin } = props;
    
    return <p onClick={toLogin}>RegisterCard</p>
});
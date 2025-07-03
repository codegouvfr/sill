import type { PageRoute } from "./route";

type Props = {
    className?: string;
    route?: PageRoute;
};

export default function Page404(props: Props) {
    const { className } = props;

    return <div className={className}>Not found</div>;
}

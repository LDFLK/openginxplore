import { useCabinetFlow } from "../../../hooks/useCabinetFlow";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ShareLinkButton from "../../../components/ShareLinkButton";

const CabinetFlow = () => {
    const navigate = useNavigate();
    const { presidentId } = useParams();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const state = location.state || {};

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const dates = [startDate, endDate];

    const { data: cabinetFlow, isLoading: isLoadingCabinetFlow, error } = useCabinetFlow(presidentId, dates);

    console.log("cabinetFlow", cabinetFlow);

    if (isLoadingCabinetFlow) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Loading cabinet flow...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !cabinetFlow) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-6">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Cabinet Flow Not Available
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        We couldn't load this cabinet flow. It may not exist or something went wrong.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:opacity-90 transition hover:cursor-pointer"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 md:px-12 md:py-10 lg:px-20 xl:px-28 2xl:px-40 w-full bg-background min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() =>
                        state.from && state.from !== ""
                            ? navigate(state.from, {
                                state: {
                                    from: state.callback === true && state.callbackLink,
                                },
                            })
                            : navigate("/")
                    }
                    className="flex items-center gap-1 text-accent hover:text-accent/70 cursor-pointer transition-colors"
                >
                    <ChevronLeft size={18} />
                    <span className="text-sm font-medium">
                        {state.from && state.from !== "" ? "Back" : "Go to OpenGINXplore"}
                    </span>
                </button>

                <ShareLinkButton />
            </div>

            {/* <div className="w-full mb-10">

            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 mb-8" />

            <div className="w-full">
            </div> */}

        </div>
    );
};

export default CabinetFlow;

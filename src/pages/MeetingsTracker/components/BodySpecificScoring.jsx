import ScoreCircle from "../../../components/circularProgress";
import InfoTooltip from "../../../components/InfoToolTip";


export default function BodyScoring({ body }) {

    const frequencyIsDefined = body?.frequency?.type.toLowerCase() === "defined";

    return (
        <>
            {/* Right Side - scoring section */}
            < div className='flex gap-5 items-stretch justify-center col-span-4' >
                <div className='flex flex-1 flex-col items-center justify-start gap-1'>
                    <p className='font-semibold text-sm whitespace-nowrap'>Meetings Score</p>
                    <div className='flex gap-1 items-center'>
                        <p className={`text-xs text-foreground/70 whitespace-nowrap`}>{frequencyIsDefined ? 'Meeting Compliancy' : 'Meeting Frequency'}</p>
                        <div onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                            <InfoTooltip message={frequencyIsDefined ? "Explanation of meeting compliancy" : "Explanation of meeting frequency"} />
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded ${frequencyIsDefined ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>

                <div className="w-px bg-border my-1 shrink-0"></div>

                <div className='flex flex-1 flex-col items-center justify-start gap-2'>
                    <p className='font-semibold text-sm whitespace-nowrap'>RTI Responsiveness</p>
                    <ScoreCircle score={Math.floor(Math.random() * 101)} maxScore={100} size={40} strokeWidth={4} />
                </div>
            </div >
        </>
    );
}
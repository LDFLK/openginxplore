import { AlertCircleIcon, CalendarIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, ExternalLinkIcon, HistoryIcon, PaperclipIcon, Users, XCircleIcon } from "lucide-react";
import { useState } from "react";


export default function RTIRequestCarousel({ body }) {
    const [currentRtiIndex, setCurrentRtiIndex] = useState(0);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'available':
                return {
                    icon: CheckCircleIcon,
                    label: 'Minutes Available',
                    color: 'text-emerald-700',
                    bgColor: 'bg-emerald-50',
                    borderColor: 'border-emerald-200'
                };
            case 'awaiting':
                return {
                    icon: ClockIcon,
                    label: 'Awaiting Response',
                    color: 'text-amber-700',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200'
                };
            case 'rejected':
                return {
                    icon: XCircleIcon,
                    label: 'Minutes Withheld',
                    color: 'text-red-700',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200'
                };
            default:
                return {
                    icon: ClockIcon,
                    label: 'Unknown',
                    color: 'text-primary/70',
                    bgColor: 'bg-primary/5',
                    borderColor: 'border-border'
                };
        }
    };

    return (
        <div className="bg-card rounded-md border border-border p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <HistoryIcon className="w-5 h-5 text-slate-900" />
                    <h3 className="text-lg font-semibold text-slate-900">RTI History</h3>
                </div>
                {body.rtiHistory && body.rtiHistory.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentRtiIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentRtiIndex === 0}
                            className="p-1 rounded-full hover:bg-accent/10 text-foreground disabled:text-primary/30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-primary/60 font-medium w-12 text-center">
                            {currentRtiIndex + 1} / {body.rtiHistory.length}
                        </span>
                        <button
                            onClick={() => setCurrentRtiIndex(prev => Math.min(body.rtiHistory.length - 1, prev + 1))}
                            disabled={currentRtiIndex === body.rtiHistory.length - 1}
                            className="p-1 rounded-full hover:bg-accent/10 text-foreground disabled:text-primary/30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            <div className="relative overflow-hidden">
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentRtiIndex * 100}%)` }}>
                    {body.rtiHistory.map((rti, index) => {
                        const roundConfig = getStatusConfig(rti.status);
                        const RoundIcon = roundConfig.icon;
                        const roundNumber = body.rtiHistory.length - index;
                        const isLatest = index === 0;
                        return (
                            <div key={index} className="w-full shrink-0">
                                <div className={`p-4 rounded-md border ${roundConfig.borderColor} ${roundConfig.bgColor}`}>

                                    <div className="flex items-center justify-between mb-3">
                                        <h6 className="text-sm font-semibold text-foreground">
                                            RTI Request #{roundNumber}{' '}
                                            {isLatest &&
                                                <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-white">
                                                    Latest
                                                </span>
                                            }
                                        </h6>
                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${roundConfig.color}`}>
                                            <RoundIcon className="w-3.5 h-3.5" />
                                            {roundConfig.label}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                                        <div>
                                            <div className="text-primary/60 mb-0.5">Date Sent</div>
                                            <div className="font-medium text-foreground">
                                                {new Date(rti.dateSent).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        {rti.dateResponded &&
                                            <div>
                                                <div className="text-primary/60 mb-0.5">Date of Last Response</div>
                                                <div className="font-medium text-foreground">
                                                    {new Date(rti.dateResponded).toLocaleDateString('en-GB', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        }
                                    </div>

                                    <div className="mb-3">
                                        <div className="text-xs text-primary/60 mb-1">Description</div>
                                        <p className="text-xs text-foreground bg-background p-2.5 rounded border border-border/50">{rti.description}</p>
                                    </div>

                                    {rti.response &&
                                        <div className="mb-3">
                                            <div className="text-xs text-primary/60 mb-1">Response</div>
                                            <div className="text-xs text-foreground bg-background p-2.5 rounded border border-border/50">
                                                {rti.response}
                                            </div>
                                        </div>
                                    }

                                    {rti.files && rti.files.length > 0 &&
                                        <div className="mb-3">
                                            <div className="text-xs text-primary/60 mb-1.5 flex items-center gap-1">
                                                <PaperclipIcon className="w-3 h-3" />
                                                Files
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {rti.files.map((fileUrl, fIdx) => (
                                                    <a
                                                        key={fIdx}
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border bg-background hover:bg-accent/10 hover:border-accent text-foreground transition-colors"
                                                    >
                                                        <PaperclipIcon className="w-3 h-3 text-accent flex-shrink-0" />
                                                        <span className="truncate max-w-[200px]">
                                                            {fileUrl.split('/').pop()}
                                                        </span>
                                                        <ExternalLinkIcon className="w-3 h-3 text-primary/40 flex-shrink-0" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    }

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {body.rtiHistory.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                    {body.rtiHistory.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentRtiIndex(idx)}
                            className={`rounded-full transition-all duration-200 ${idx === currentRtiIndex
                                ? 'w-4 h-2 bg-accent'
                                : 'w-2 h-2 bg-border hover:bg-accent/40'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
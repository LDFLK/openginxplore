import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    FileTextIcon,
    Users
} from
    'lucide-react';
import { useParams } from 'react-router-dom';

export function MeetingBodyTile({
    body,
    onClick
}) {

    const { ministryId } = useParams();

    const latestRti = body?.rtiHistory?.sort((a, b) =>
        new Date(b.dateResponded) - new Date(a.dateResponded)
    )[0];

    const getStatusConfig = () => {
        switch (latestRti.status) {
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
            case 'withheld':
                return {
                    icon: XCircleIcon,
                    label: 'Minutes Withheld',
                    color: 'text-red-700',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200'
                };
        }
    };
    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;
    return (
        <button
            onClick={onClick}
            className="group w-full rounded-sm border border-border bg-card hover:bg-accent/10 hover:border-accent/40 hover:shadow-md transition-all duration-300 cursor-pointer flex overflow-hidden text-left h-full">

            <div className="w-1 bg-accent shrink-0"></div>

            <div className="p-4 flex flex-col gap-1 flex-1">
                <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm md:text-base font-semibold text-foreground group-hover:text-accent transition-colors pr-4">
                        {body.name}
                    </h4>
                </div>

                <div className="space-y-2 mt-auto">
                    <div className="flex flex-wrap items-center gap-2">
                        <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`} />
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${statusConfig.color}`}>
                                <Users className="w-3 h-3" />
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                        <FileTextIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-medium text-slate-600">
                            {rtiCount} {rtiCount === 1 ? 'RTI sent' : 'RTIs sent'}
                        </span>
                    </div> */}

                    {latestRti.dateResponded &&
                        <div className="text-xs text-primary/60 pt-0.5">
                            Latest RTI Response:{' '}
                            {new Date(latestRti.dateResponded).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </div>
                    }
                </div>
            </div>
        </button>);
}
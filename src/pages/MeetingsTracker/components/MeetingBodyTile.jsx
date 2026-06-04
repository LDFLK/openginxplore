import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    FileTextIcon,
    Users,
    ScaleIcon
} from 'lucide-react';
import { useParams } from 'react-router-dom';

export function MeetingBodyTile({
    body,
    onClick
}) {
    console.log(body)

    const rtiCount = body?.rtiHistory?.length || 0;
    const meetingsCount = body?.meetingInstances?.length || 0;

    const latestRti = body?.rtiHistory?.sort((a, b) =>
        new Date(b.dateResponded) - new Date(a.dateResponded)
    )[0];

    const getStatusColor = (statusName) => {
        switch (statusName) {
            case 'available':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'awaiting':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    }

    return (
        <button
            onClick={onClick}
            className="group w-full rounded-sm border border-border bg-card hover:bg-accent/10 hover:border-accent/40 hover:shadow-md transition-all duration-300 cursor-pointer flex overflow-hidden text-left h-full">

            <div className="w-1 bg-accent shrink-0"></div>

            <div className="p-3 flex flex-col flex-1 gap-4">
                <h4 className="text-sm md:text-md font-semibold text-foreground group-hover:text-accent transition-colors">
                    {body.fullName} {body?.name && `(${body.name})`}
                </h4>

                <div className="">
                    <div className='flex gap-2'>
                        <div className="flex flex-wrap items-center gap-2">
                            <div
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50`}>
                                <div
                                    className={`w-1.5 h-1.5 rounded-full bg-emerald-700`} />
                                <span className={`inline-flex items-center gap-1 text-xs font-medium text-emerald-700`}>
                                    <Users className="w-3 h-3" />
                                    {meetingsCount} Meetings
                                </span>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                            <FileTextIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600">
                                {rtiCount} {rtiCount === 1 ? 'RTI sent' : 'RTIs sent'}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    {latestRti &&
                        <div className="text-sm text-primary/60 flex items-center gap-2">
                            <span className="font-semibold">
                                Latest RTI Request:
                            </span>
                            <span className={`${getStatusColor(latestRti.status)} px-2.5 py-1.5 rounded-full text-sm font-medium`}>
                                {latestRti?.status
                                    ? latestRti.status.charAt(0).toUpperCase() + latestRti.status.slice(1).toLowerCase()
                                    : ''}
                            </span>
                            <span>
                                {new Date(latestRti?.dateResponded).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>

                        </div>
                    }
                </div>
            </div>
        </button>);
}
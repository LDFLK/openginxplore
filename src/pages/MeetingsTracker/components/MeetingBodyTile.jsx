import {
    FileTextIcon,
    Component
} from 'lucide-react';
import BodyScoring from './BodySpecificScoring';

export function MeetingBodyTile({
    body,
    onClick
}) {

    const rtiCount = body?.rtiHistory?.length || 0;
    const meetingsCount = body?.meetingInstances?.length || 0;
    const frequencyIsDefined = body?.frequency?.type.toLowerCase() === "defined";

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
            className="group w-full rounded-sm border border-border bg-card hover:bg-accent/10 hover:border-accent/40 hover:shadow-md transition-all duration-300 cursor-pointer flex text-left h-full relative">

            <div className="w-1 bg-accent shrink-0 rounded-l-sm"></div>

            <div className="grid grid-cols-12 w-full p-3 items-center gap-4 shadow-sm">
                {/* Left Side */}
                <div className="flex flex-col col-span-5 gap-3">
                    <h4 className="text-sm md:text-md font-semibold text-foreground group-hover:text-accent transition-colors">
                        {body.fullName} {body?.name && `(${body.name})`}
                    </h4>

                    {/* meetings and rtis count */}
                    <div className='flex gap-2'>
                        <div className="flex flex-wrap items-center gap-2">
                            <div
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50`}>
                                <Component className="w-3.5 h-3.5 text-slate-500" /><span className={`inline-flex items-center gap-1 text-xs font-medium text-emerald-700`}>
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

                {/* Center - latest rti details */}
                <div className="flex justify-center items-center col-span-3">
                    {latestRti &&
                        <div className="text-xs text-primary/60 flex flex-col items-center gap-1.5">
                            <span className="font-semibold whitespace-nowrap">
                                Latest RTI Request
                            </span>
                            <div className="flex items-center gap-2">
                                <span className={`${getStatusColor(latestRti.status)} px-2.5 py-1 rounded border font-medium`}>
                                    {latestRti?.status
                                        ? latestRti.status.charAt(0).toUpperCase() + latestRti.status.slice(1).toLowerCase()
                                        : ''}
                                </span>
                                <span className="text-muted-foreground">
                                    {new Date(latestRti?.dateResponded).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    }
                </div>

                {/* Right Side - scoring section */}
                <BodyScoring body={body} />
            </div>
        </button >);
}
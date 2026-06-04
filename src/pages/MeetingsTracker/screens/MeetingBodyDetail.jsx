import { useParams, useNavigate } from 'react-router-dom';
import {
    CalendarIcon,
    FileTextIcon,
    Users,
    UsersIcon,
    ScaleIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    AlertCircleIcon,
    ExternalLinkIcon,
    HistoryIcon
} from
    'lucide-react';
import { meetingBodies } from '../../../data/mockdata';
import { MeetingsTable } from '../components/MeetingsTable';
import BackButton from '../../../components/backButton';

export function BodyDetailPage() {
    const { ministryId, bodyId } = useParams();
    const navigate = useNavigate();

    // meetingBodies contains objects with .ministryId
    const ministry = meetingBodies.find((m) => m.ministryId === ministryId);
    const body = ministry?.bodies.find((b) => b.id === bodyId);

    const getLatestRti = (body) => {
        if (!body?.rtiHistory || body.rtiHistory.length === 0) return { status: 'unknown' };
        return [...body.rtiHistory].sort((a, b) =>
            new Date(b.dateResponded || 0) - new Date(a.dateResponded || 0)
        )[0];
    };

    if (!ministry || !body) {
        return (
            <div className="px-4 py-8">
                <p className="text-primary/70">Body not found</p>
            </div>);
    }
    const latestRti = getLatestRti(body);
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
            case 'withheld':
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
    const latestStatusConfig = getStatusConfig(latestRti.status);
    const LatestStatusIcon = latestStatusConfig.icon;
    return (
        <>
            {/* Back button to ministry page */}
            <BackButton onClick={() => navigate(`/meetingsTracker/ministry/${ministryId}`)} text={`Back to ${ministry.name || ministry.title}`} />

            <div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-10 rounded-full bg-accent" />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                                {body.fullName || body.name}
                            </h1>
                            <p className="text-xs text-primary/70 mt-0.5">{ministry.title || ministry.name}</p>
                        </div>
                    </div>
                </div>

                {/* Latest RTI status banner */}
                <div className={`flex items-center gap-3 p-3 rounded-md border ${latestStatusConfig.borderColor} ${latestStatusConfig.bgColor}`}>
                    <LatestStatusIcon className={`w-5 h-5 ${latestStatusConfig.color}`} />
                    <div>
                        <div className={`text-sm font-semibold ${latestStatusConfig.color}`}>
                            {latestStatusConfig.label}
                        </div>
                        {latestRti.dateResponded &&
                            <div className="text-xs text-primary/70 mt-0.5">
                                Latest response on{' '}
                                {new Date(latestRti.dateResponded).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>
                        }
                    </div>
                </div>

                {/* Body Information */}
                <div className="bg-card rounded-md border border-border p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-accent mb-3">
                        Body Information
                    </h3>

                    <div className="flex items-start gap-3">
                        <ScaleIcon className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-xs font-medium text-primary/60 mb-0.5">Legal Basis</div>
                            <div className="text-sm text-foreground font-medium">{body.enablingAct}</div>
                            {body.actSection &&
                                <div className="text-xs text-primary/70 mt-0.5">{body.actSection}</div>
                            }
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <UsersIcon className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-xs font-medium text-primary/60 mb-0.5">Chair</div>
                            <div className="text-sm text-foreground">{body.chair}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <FileTextIcon className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-xs font-medium text-primary/60 mb-0.5">Mandates</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {body.mandate.map((mandate, index) => (
                                    <div key={index} className="border border-border p-2 rounded-md bg-primary/5">
                                        <div className="text-xs font-medium text-foreground">{mandate.description}</div>
                                        {mandate.body && <div className="text-xs text-primary/70">{mandate.body}</div>}
                                        {mandate.section && <div className="text-xs text-primary/70">{mandate.section}</div>}
                                        {mandate.frequency && <div className="text-xs text-primary/70">{mandate.frequency}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meetings Table */}
                <MeetingsTable body={body} />

                {/* RTI History */}
                <div className="bg-card rounded-md border border-border p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <HistoryIcon className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold text-accent">RTI History</h3>
                    </div>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                        {body.rtiHistory.map((rti, index) => {
                            const roundConfig = getStatusConfig(rti.status);
                            const RoundIcon = roundConfig.icon;
                            const roundNumber = body.rtiHistory.length - index;
                            const isLatest = index === 0;
                            return (
                                <div key={index} className="relative flex items-start gap-6">
                                    <div
                                        className={`absolute left-0 w-5 h-5 rounded-full border-4 border-card ${isLatest ? roundConfig.bgColor : 'bg-border'} flex items-center justify-center z-10`}>
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full ${isLatest ? roundConfig.color.replace('text-', 'bg-') : 'bg-primary/30'}`} />
                                    </div>

                                    <div className="ml-8 w-full">
                                        <div className={`p-4 rounded-md border ${isLatest ? roundConfig.borderColor : 'border-border'} ${isLatest ? roundConfig.bgColor : 'bg-card'}`}>

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

                                            {rti.meetingDetails && rti.meetingDetails.length > 0 &&
                                                <div className="mb-3">
                                                    <div className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                                                        <CalendarIcon className="w-3.5 h-3.5 text-primary/60" />
                                                        Meeting Details Received
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {rti.meetingDetails.map((meeting, mIndex) =>
                                                            <a
                                                                key={mIndex}
                                                                href={meeting.minutesLink || rti.minutesLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-between text-xs bg-card p-2 rounded border border-border hover:bg-accent/5 transition-colors">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span className="font-medium text-foreground">{meeting.description}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-primary/60">
                                                                    <span>{meeting.date}</span>
                                                                    <ExternalLinkIcon className="w-3 h-3" />
                                                                </div>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            }

                                            {rti.status === 'withheld' && rti.exemptionReason &&
                                                <div className="mt-2 p-2.5 bg-red-50/50 border border-red-100 rounded-md flex items-start gap-2">
                                                    <AlertCircleIcon className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-xs font-semibold text-red-900 mb-0.5">Exemption Claimed</div>
                                                        <div className="text-xs text-red-800">{rti.exemptionReason}</div>
                                                        <p className="text-xs underline cursor-pointer hover:text-red-700 transition-colors mt-1">Click here for more information</p>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>);
                        })}
                    </div>
                </div>
            </div>
        </ >);
}

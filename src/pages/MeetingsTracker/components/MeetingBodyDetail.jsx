import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeftIcon,
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
import { MeetingsTable } from './MeetingsTable';

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-slate-600">Body not found</p>
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
                    color: 'text-slate-700',
                    bgColor: 'bg-slate-50',
                    borderColor: 'border-slate-200'
                };
        }
    };
    const latestStatusConfig = getStatusConfig(latestRti.status);
    const LatestStatusIcon = latestStatusConfig.icon;
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.button
                initial={{
                    opacity: 0,
                    x: -10
                }}
                animate={{
                    opacity: 1,
                    x: 0
                }}
                onClick={() => navigate(`/meetingsTracker/ministry/${ministryId}`)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">

                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium">Back to {ministry.name || ministry.title}</span>
            </motion.button>

            <motion.div
                initial={{
                    opacity: 0,
                    y: 10
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                className="space-y-6">

                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-1 h-12 rounded-full"
                            style={{
                                backgroundColor: ministry.color
                            }} />

                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                                {body.fullName || body.name}
                            </h1>
                            <p className="text-sm text-slate-600 mt-1">{ministry.title || ministry.name}</p>
                        </div>
                    </div>
                </div>

                <div
                    className={`flex items-center gap-3 p-4 rounded-lg border ${latestStatusConfig.borderColor} ${latestStatusConfig.bgColor}`}>

                    <LatestStatusIcon className={`w-6 h-6 ${latestStatusConfig.color}`} />
                    <div>
                        <div className={`font-semibold ${latestStatusConfig.color}`}>
                            {latestStatusConfig.label}
                        </div>
                        {latestRti.dateResponded &&
                            <div className="text-sm text-slate-600 mt-0.5">
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

                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Body Information
                    </h3>

                    <div className="flex items-start gap-3">
                        <ScaleIcon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-sm font-medium text-slate-500 mb-1">
                                Legal Basis
                            </div>
                            <div className="text-slate-900 font-medium">
                                {body.enablingAct}
                            </div>
                            {body.actSection &&
                                <div className="text-sm text-slate-600 mt-0.5">
                                    {body.actSection}
                                </div>
                            }
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <UsersIcon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-sm font-medium text-slate-500 mb-1">
                                Chair
                            </div>
                            <div className="text-slate-900">{body.chair}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <FileTextIcon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="text-sm font-medium text-slate-500 mb-1">
                                Mandates
                            </div>
                            <div className="text-slate-900 flex items-center gap-2">{body.mandate.map((mandate, index) => (
                                <div key={index} className="last:mb-0 border p-2 border-slate-200 rounded-lg">
                                    <div className="font-medium">{mandate.description}</div>
                                    {mandate.body && (
                                        <div className="text-sm text-slate-600">
                                            {mandate.body}
                                        </div>
                                    )}
                                    {mandate.section && (
                                        <div className="text-sm text-slate-600">
                                            {mandate.section}
                                        </div>
                                    )}

                                    {mandate.frequency && (
                                        <div className="text-sm text-slate-600">
                                            {mandate.frequency}
                                        </div>
                                    )}
                                </div>
                            ))}</div>
                        </div>
                    </div>

                    {/* <div className="flex items-start gap-3">
              <FileTextIcon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-500 mb-1">
                  Composition
                </div>
                <div className="text-slate-900">{body.composition}</div>
              </div>
            </div> */}

                    {/* <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-500 mb-1">
                  Meeting Frequency
                </div>
                <div className="text-slate-900">
                  {body.frequency.type === 'defined' ?
                  body.frequency.interval :
                  'Not specified in enabling Act'}
                </div>
              </div>
            </div> */}



                </div>
                <MeetingsTable body={body} />
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <HistoryIcon className="w-5 h-5 text-slate-900" />
                        <h3 className="text-lg font-semibold text-slate-900">
                            RTI History
                        </h3>
                    </div>

                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
                        {body.rtiHistory.map((rti, index) => {
                            const roundConfig = getStatusConfig(rti.status);
                            const RoundIcon = roundConfig.icon;
                            const roundNumber = body.rtiHistory.length - index;
                            const isLatest = index === 0;
                            return (
                                <div key={index} className="relative flex items-start gap-6">
                                    <div
                                        className={`absolute left-0 w-5 h-5 rounded-full border-4 border-white ${isLatest ? roundConfig.bgColor : 'bg-slate-300'} flex items-center justify-center z-10`}>

                                        <div
                                            className={`w-2.5 h-2.5 rounded-full ${isLatest ? roundConfig.color.replace('text-', 'bg-') : 'bg-slate-400'}`} />

                                    </div>

                                    <div className="ml-8 w-full">
                                        <div
                                            className={`p-5 rounded-xl border ${isLatest ? roundConfig.borderColor : 'border-slate-200'} ${isLatest ? roundConfig.bgColor : 'bg-white'} shadow-sm`}>

                                            <div className="flex items-center justify-between mb-4">
                                                <h6 className="font-semibold text-slate-900">
                                                    RTI Request #{roundNumber}{' '}
                                                    {isLatest &&
                                                        <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-900 text-white">
                                                            Latest
                                                        </span>
                                                    }
                                                </h6>
                                                <div
                                                    className={`flex items-center gap-1.5 text-sm font-medium ${roundConfig.color}`}>

                                                    <RoundIcon className="w-4 h-4" />
                                                    {roundConfig.label}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                <div>
                                                    <div className="text-slate-500 mb-1">Date Sent</div>
                                                    <div className="font-medium text-slate-900">
                                                        {new Date(rti.dateSent).toLocaleDateString(
                                                            'en-GB',
                                                            {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                                {rti.dateResponded &&
                                                    <div>
                                                        <div className="text-slate-500 mb-1">
                                                            Date of Last Response
                                                        </div>
                                                        <div className="font-medium text-slate-900">
                                                            {new Date(rti.dateResponded).toLocaleDateString(
                                                                'en-GB',
                                                                {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                }
                                            </div>

                                            <div className="mb-4">
                                                <div className="text-sm text-slate-500 mb-1">Description</div>
                                                <p className="text-sm text-slate-900 bg-white/50 p-3 rounded-lg border border-slate-100">{rti.description}</p>
                                            </div>



                                            {rti.response &&
                                                <div className="mb-4">
                                                    <div className="text-sm text-slate-500 mb-1">
                                                        Response
                                                    </div>
                                                    <div className="text-sm text-slate-800 bg-white/50 p-3 rounded-lg border border-slate-100">
                                                        {rti.response}
                                                    </div>
                                                </div>
                                            }

                                            {rti.meetingDetails && rti.meetingDetails.length > 0 &&
                                                <div className="mb-4">
                                                    <div className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                                                        <CalendarIcon className="w-4 h-4 text-slate-500" />
                                                        Meeting Details Received
                                                    </div>

                                                    <div className="space-y-2">
                                                        {rti.meetingDetails.map((meeting, mIndex) =>
                                                            <a
                                                                key={mIndex}
                                                                href={meeting.minutesLink || rti.minutesLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-between text-sm bg-white p-2.5 rounded border border-slate-100 hover:bg-gray-50 transition-colors">

                                                                <div className="flex items-center gap-2">
                                                                    <Users className="w-4 h-4 text-emerald-600" />
                                                                    <span className="font-medium text-slate-700">
                                                                        {meeting.description}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2 text-slate-500">
                                                                    <span>{meeting.date}</span>
                                                                    <ExternalLinkIcon className="w-3 h-3" />
                                                                </div>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            }

                                            {rti.status === 'withheld' && rti.exemptionReason &&
                                                <div className="mt-2 p-3 bg-red-50/50 border border-red-100 rounded-lg flex items-start gap-2.5">
                                                    <AlertCircleIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-xs font-semibold text-red-900 mb-0.5">
                                                            Exemption Claimed
                                                        </div>
                                                        <div className="text-sm text-red-800">
                                                            {rti.exemptionReason}
                                                        </div>
                                                        <p className="text-sm underline cursor-pointer hover:text-red-700 transition-colors">Click here for more information</p>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>);

                        })}
                    </div>
                </div>
            </motion.div>
        </div>);

}
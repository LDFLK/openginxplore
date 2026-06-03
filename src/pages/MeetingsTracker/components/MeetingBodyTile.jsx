import React from 'react';
import { motion } from 'framer-motion';
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    FileTextIcon,
    Users
} from
    'lucide-react';

export function MeetingBodyTile({
    body,
    ministryId,
    onClick,
    index
}) {
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
        <motion.button
            initial={{
                opacity: 0,
                x: -20
            }}
            animate={{
                opacity: 1,
                x: 0
            }}
            transition={{
                delay: index * 0.05
            }}
            onClick={onClick}
            className="group w-full bg-white rounded-lg border-2 border-slate-200 hover:border-slate-300 p-5 text-left transition-all hover:shadow-md flex flex-col h-full">

            <div className="flex items-start justify-between mb-3 w-full">
                <h4 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors pr-4">
                    {body.name}
                </h4>
                <div
                    className={`flex-shrink-0 p-1.5 rounded-full ${statusConfig.bgColor}`}>

                    <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                </div>
            </div>

            <div className="space-y-3 mt-auto w-full">
                {/* <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Frequency:</span>
          <span className="text-sm text-slate-700">
            {body.frequency.type === 'defined' ?
            body.frequency.interval :
            'Not specified'}
          </span>
        </div> */}

                <div className="flex flex-wrap items-center gap-2">
                    <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.borderColor} ${statusConfig.bgColor}`}>

                        <div
                            className={`w-2 h-2 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`} />
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusConfig.color}`}>
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">
                                {statusConfig.label}
                            </span>
                        </span>
                    </div>

                    {/* <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                        <FileTextIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-medium text-slate-600">
                            {rtiCount} {rtiCount === 1 ? 'RTI sent' : 'RTIs sent'}
                        </span>
                    </div> */}
                </div>

                {latestRti.dateResponded &&
                    <div className="text-xs text-slate-500 pt-1">
                        Latest response:{' '}
                        {new Date(latestRti.dateResponded).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </div>
                }
            </div>
        </motion.button>);

}
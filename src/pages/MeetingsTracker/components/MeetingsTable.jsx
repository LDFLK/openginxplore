import React from 'react';
import { Users, ExternalLinkIcon, CalendarIcon } from 'lucide-react';

export function MeetingsTable({ body }) {
    const allMeetings = body.rtiHistory.flatMap((rti, index) => {
        if (!rti.meetingDetails) return [];
        const rtiRound = body.rtiHistory.length - index;
        return rti.meetingDetails.map((meeting) => ({
            date: meeting.date,
            description: meeting.description,
            minutesLink: meeting.minutesLink || rti.minutesLink,
            rtiRound
        }));
    });
    if (allMeetings.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-5 h-5 text-slate-900" />
                    <h3 className="text-lg font-semibold text-slate-900">Meetings</h3>
                </div>
                <div className="text-center py-8 text-slate-400 text-sm">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No meeting records available yet
                </div>
            </div>);

    }
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-slate-900" />
                    <h3 className="text-lg font-semibold text-slate-900">Meetings</h3>
                </div>
                <span className="text-sm text-slate-500">
                    {allMeetings.length} meeting{allMeetings.length !== 1 ? 's' : ''}{' '}
                    recorded
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-semibold text-slate-600">
                                #
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-600">
                                Date
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-600">
                                Description
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-600">
                                RTI Request No.
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-600">
                                Minutes
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {allMeetings.map((meeting, idx) =>
                            <tr
                                key={idx}
                                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">

                                <td className="py-3 px-4 text-slate-400 tabular-nums">
                                    {idx + 1}
                                </td>
                                <td className="py-3 px-4 text-slate-900 font-medium whitespace-nowrap">
                                    {meeting.date}
                                </td>
                                <td className="py-3 px-4 text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        {meeting.description}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                        #{meeting.rtiRound}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    {meeting.minutesLink ?
                                        <a
                                            href={meeting.minutesLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors font-medium">

                                            View
                                            <ExternalLinkIcon className="w-3 h-3" />
                                        </a> :

                                        <span className="text-slate-400">—</span>
                                    }
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>);

}
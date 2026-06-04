import React from 'react';
import { Users, ExternalLinkIcon, CalendarIcon } from 'lucide-react';

export function MeetingsTable({ body }) {
    const allMeetings = body.meetingInstances
        ? body.meetingInstances.map((meeting) => ({
            date: meeting.date,
            description: meeting.id || meeting.description,
            files: meeting.files || (meeting.minutesLink ? [meeting.minutesLink] : []),
            rtiRound: null
        }))
        : (body.rtiHistory || []).flatMap((rti, index) => {
            if (!rti.meetingDetails) return [];
            const rtiRound = body.rtiHistory.length - index;
            return rti.meetingDetails.map((meeting) => ({
                date: meeting.date,
                description: meeting.description,
                files: (meeting.minutesLink || rti.minutesLink) ? [meeting.minutesLink || rti.minutesLink] : [],
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
                                <td className="py-3 px-4">
                                    {meeting.files && meeting.files.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {meeting.files.map((fileUrl, fIdx) => (
                                                <a
                                                    key={fIdx}
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors font-medium">

                                                    View {meeting.files.length > 1 ? fIdx + 1 : ''}
                                                    <ExternalLinkIcon className="w-3 h-3" />
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">—</span>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>);

}
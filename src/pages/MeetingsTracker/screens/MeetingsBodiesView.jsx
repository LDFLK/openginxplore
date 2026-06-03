import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { meetingBodies } from '../../../data/mockdata';
import { MeetingBodyTile } from '../components/meetingBodyTile';

export function MeetingBodiesView() {
    const { ministryId } = useParams();
    const navigate = useNavigate();
    const ministry = meetingBodies.find((m) => m.ministryId === ministryId);
    if (!ministry) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-slate-600">Ministry not found</p>
            </div>
        );

    }
    return (
        <>
            <div
                onClick={() => navigate('/meetingsTracker')}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 mb-2 transition-colors mt-4 cursor-pointer">

                <ArrowLeftIcon className="w-3 h-3" />
                <span className="font-medium text-xs">Back to Ministries</span>
            </div>

            <div className="mb-4">
                <div className="flex items-center">
                    <div
                        className="w-1.5 h-12 rounded-full"
                        style={{
                            backgroundColor: ministry.color
                        }} />

                    <h2 className="text-xl font-semibold text-slate-900">
                        {ministry.title || ministry.name}
                    </h2>
                </div>
                <p className="text-sm text-slate-600 ml-2">
                    {ministry.bodies.length} meeting{' '}
                    {ministry.bodies.length === 1 ? 'body' : 'bodies'} tracked
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ministry.bodies.map((body, index) =>
                    <MeetingBodyTile
                        key={body.id}
                        body={body}
                        ministryId={ministry.id}
                        onClick={() => navigate(`/meetingsTracker/ministry/${ministry.ministryId}/body/${body.id}`)}
                        index={index} />

                )}
            </div>
        </>
    );

}
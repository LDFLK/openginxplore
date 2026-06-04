import { useParams, useNavigate } from 'react-router-dom';
import { MeetingBodyTile } from '../components/meetingBodyTile';
import BackButton from '../../../components/backButton';
import { useMeetingsMinistryBodiesData, useMeetingsMinistryData } from '../../../hooks/useMeetingsTracker';
import { Loader2 } from 'lucide-react';

export function MeetingBodiesView() {
    const { ministryId } = useParams();
    const navigate = useNavigate();

    const { data: ministry, isLoading: isMeetingMinistryDataLoading } = useMeetingsMinistryData(ministryId);
    const { data: ministryBodies, isLoading: isMeetingMinistryBodyDataLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useMeetingsMinistryBodiesData(ministryId, 20);
    const bodies = ministryBodies?.pages?.flatMap((page) => page.data) ?? [];

    if (isMeetingMinistryDataLoading || isMeetingMinistryBodyDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] mt-4">
                <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
                <p className="text-primary/70 text-sm md:text-md">Loading bodies...</p>
            </div>
        );
    }

    return (
        <>
            {/* Back button */}
            <BackButton onClick={() => navigate('/meetingsTracker')} text="Back to Ministries" />

            <div className="mb-4 gap-4">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                    {ministry?.data?.title}
                </h2>
                <p className="text-sm text-primary/70">
                    {ministry?.data?.bodies?.length} meeting{' '}
                    {ministry?.data?.bodies?.length === 1 ? 'body' : 'bodies'} tracked
                </p>
            </div>

            <div className="grid rid-cols-2 md:grid-cols-3 gap-4">
                {bodies && bodies.map((body) =>
                    <MeetingBodyTile
                        key={body.id}
                        body={body}
                        onClick={() => navigate(`/meetingsTracker/ministry/${ministryId}/body/${body.id}`)}
                    />
                )}
            </div>
        </>
    );

}
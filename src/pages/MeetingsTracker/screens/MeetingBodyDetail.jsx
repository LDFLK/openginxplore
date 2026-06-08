import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Info, CalendarDays, FileSearch } from 'lucide-react';
import { useState } from 'react';
import { MeetingsTable } from '../components/MeetingsTable';
import BackButton from '../../../components/backButton';
import { useMeetingsMinistryBodyData, useMeetingsMinistryData } from '../../../hooks/useMeetingsTracker';
import MeetingBodyInformation from '../components/MeetingBodyInformation';
import RTIRequestCarousel from '../components/RTIRequestHistoryCarousel';
import BodyScoring from '../components/BodySpecificScoring';

const TABS = [
    { id: 'information', label: 'Information', icon: Info },
    { id: 'meetings', label: 'Meetings', icon: CalendarDays },
    { id: 'rti', label: 'RTI Requests', icon: FileSearch },
];

export function BodyDetailPage() {
    const { ministryId, bodyId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('information');

    const { data: ministryData, isLoading: isMeetingMinistryDataLoading } = useMeetingsMinistryData(ministryId);
    const { data: bodyData, isLoading: isMeetingMinistryBodyDataLoading } = useMeetingsMinistryBodyData(ministryId, bodyId);

    const ministry = ministryData?.data;
    const body = bodyData?.data;

    if (isMeetingMinistryDataLoading || isMeetingMinistryBodyDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] mt-4">
                <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
                <p className="text-primary/70 text-sm md:text-md">Loading body...</p>
            </div>
        );
    }

    return (
        <>
            {/* Back button to ministry page */}
            <BackButton onClick={() => navigate(`/meetingsTracker/ministry/${ministryId}`)} text={`Go Back`} />

            <div className="space-y-4 my-4">
                <div className='block md:flex justify-between items-center gap-4'>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2 min-w-0">
                        <div className="w-1 h-10 rounded-full bg-accent shrink-0" />
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                                {body.fullName || body.name}
                            </h1>
                            <p className="text-xs text-primary/70 mt-0.5 truncate">{ministry.title || ministry.name}</p>
                        </div>
                    </div>
                    {/* Scoring Section */}
                    <div className="shrink-0">
                        <BodyScoring body={body} />
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1 border-b border-border">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors relative cursor-pointer
                                ${activeTab === id
                                    ? 'text-accent'
                                    : 'text-primary/60 hover:text-foreground'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            {activeTab === id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'information' && <MeetingBodyInformation body={body} />}
                {activeTab === 'meetings' && <MeetingsTable body={body} />}
                {activeTab === 'rti' && <RTIRequestCarousel body={body} />}
            </div>
        </>
    );
}


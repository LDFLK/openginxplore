import { ClockIcon, FileTextIcon, Info, ScaleIcon, Users, UsersIcon } from "lucide-react";

export default function MeetingBodyInformation({ body }) {

    return (
        <div className="bg-card rounded-md border border-border p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-slate-900" />
                <h3 className="text-lg font-semibold text-slate-900">Body Information</h3>
            </div>

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

            {body.composition && (
                <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" />
                    <div>
                        <div className="text-xs font-medium text-primary/60 mb-0.5">Composition</div>
                        <div className="text-sm text-foreground max-w-3xl">{body.composition}</div>
                    </div>
                </div>
            )}

            {body.frequency && (
                <div className="flex items-start gap-3">
                    <ClockIcon className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" />
                    <div>
                        <div className="text-xs font-medium text-primary/60 mb-0.5">Meeting Frequency</div>
                        <div className="text-sm text-foreground capitalize">{body.frequency.type}: {body.frequency.interval}</div>
                    </div>
                </div>
            )}

            <div className="flex items-start gap-3">
                <FileTextIcon className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" />
                <div>
                    <div className="text-xs font-medium text-primary/60 mb-0.5">Mandates</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {body.mandate.map((mandate, index) => (
                            <div key={index} className="border border-border p-2 rounded-md bg-primary/5 max-w-lg space-y-1">
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
    )
}
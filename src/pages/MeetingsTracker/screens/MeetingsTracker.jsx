import { Outlet } from "react-router-dom";

export default function MeetingsTracker() {

    return (
        <div className="p-2 lg:p-4">
            <div className="bg-white dark:bg-gray-800 p-2 lg:p-4 rounded-sm border border-border">

                {/* nested routes */}
                <Outlet />

            </div>

        </div>
    )
}
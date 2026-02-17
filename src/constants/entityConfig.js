import { User, Building2, Landmark, Database } from "lucide-react";

/**
 * Entity type configuration for styling and icons
 */
export const ENTITY_CONFIG = {
    person: {
        icon: User,
        label: "Person",
        bgColor: "bg-green-500/10",
        textColor: "text-green-600",
        borderColor: "border-green-500/20",
    },
    department: {
        icon: Building2,
        label: "Department",
        bgColor: "bg-blue-500/10",
        textColor: "text-blue-600",
        borderColor: "border-blue-500/20",
    },
    ministry: {
        icon: Landmark,
        label: "Ministry",
        bgColor: "bg-purple-500/10",
        textColor: "text-purple-600",
        borderColor: "border-purple-500/20",
    },
    cabinetMinister: {
        icon: Landmark,
        label: "Cabinet Minister",
        bgColor: "bg-purple-500/10",
        textColor: "text-purple-600",
        borderColor: "border-purple-500/20",
    },
    stateMinister: {
        icon: Landmark,
        label: "State Minister",
        bgColor: "bg-purple-500/10",
        textColor: "text-purple-600",
        borderColor: "border-purple-500/20",
    },
    dataset: {
        icon: Database,
        label: "Dataset",
        bgColor: "bg-orange-500/10",
        textColor: "text-orange-600",
        borderColor: "border-orange-500/20",
    },
};

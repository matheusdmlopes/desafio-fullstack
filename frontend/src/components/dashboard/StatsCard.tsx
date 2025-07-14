import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: "blue" | "green" | "purple" | "yellow" | "red" | "indigo" | "pink" | "gray";
    loading?: boolean;
    description?: string;
    href?: string;
}

const colorClasses = {
    blue: {
        bg: "bg-blue-50",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        textColor: "text-blue-600"
    },
    green: {
        bg: "bg-green-50",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        textColor: "text-green-600"
    },
    purple: {
        bg: "bg-purple-50",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        textColor: "text-purple-600"
    },
    yellow: {
        bg: "bg-yellow-50",
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        textColor: "text-yellow-600"
    },
    red: {
        bg: "bg-red-50",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        textColor: "text-red-600"
    },
    indigo: {
        bg: "bg-indigo-50",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        textColor: "text-indigo-600"
    },
    pink: {
        bg: "bg-pink-50",
        iconBg: "bg-pink-100",
        iconColor: "text-pink-600",
        textColor: "text-pink-600"
    },
    gray: {
        bg: "bg-gray-50",
        iconBg: "bg-gray-100",
        iconColor: "text-gray-600",
        textColor: "text-gray-600"
    }
};

export default function StatsCard({
    title,
    value,
    icon: Icon,
    color,
    loading = false,
    description,
    href
}: StatsCardProps) {
    const classes = colorClasses[color];

    const CardContent = () => (
        <div className={`${classes.bg} rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                            {description && <div className="h-4 bg-gray-200 rounded w-24"></div>}
                        </div>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                            {description && (
                                <p className="text-sm text-gray-600 mt-1">{description}</p>
                            )}
                        </>
                    )}
                </div>
                <div className={`${classes.iconBg} rounded-full p-3`}>
                    <Icon className={`h-6 w-6 ${classes.iconColor}`} />
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <a href={href} className="block">
                <CardContent />
            </a>
        );
    }

    return <CardContent />;
} 
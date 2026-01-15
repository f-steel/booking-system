export const BOOKING_STATUSES = {
  pending_confirmation: {
    label: "Pending Confirmation",
    color: "bg-yellow-100 text-yellow-800",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-purple-100 text-purple-800",
  },
  ready_for_collection: {
    label: "Ready for Collection",
    color: "bg-green-100 text-green-800",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
  },
} as const;

export function getStatusInfo(status: string) {
  return (
    BOOKING_STATUSES[status as keyof typeof BOOKING_STATUSES] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    }
  );
}


import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// Define the shape of our sync statuses
export type SyncStatus = "synced" | "syncing" | "failed" | "unknown";

interface SyncStatusContextType {
  syncStatuses: Record<string, SyncStatus>;
  updateSyncStatus: (distroId: string, status: SyncStatus) => void;
}

// Create the context with a default value
const SyncStatusContext = createContext<SyncStatusContextType>({
  syncStatuses: {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateSyncStatus: () => {},
});

// Custom hook to use the context
export const useSyncStatus = () => useContext(SyncStatusContext);

// Provider component
export const SyncStatusProvider = ({ children }: { children: ReactNode }) => {
  const [syncStatuses, setSyncStatuses] = useState<Record<string, SyncStatus>>(
    {},
  );

  // Function to update a specific distro's sync status
  const updateSyncStatus = (distroId: string, status: SyncStatus) => {
    setSyncStatuses((prev) => ({
      ...prev,
      [distroId]: status,
    }));
  };

  // Fetch the initial statuses from our API endpoint
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        // Use the new API endpoint instead of the static JSON file
        const response = await fetch("/api/mirror-status");
        if (!response.ok) {
          throw new Error("Failed to fetch mirror status");
        }

        const data = await response.json();

        // Use the distroStatuses from our API response
        if (data.distroStatuses) {
          setSyncStatuses(data.distroStatuses as Record<string, SyncStatus>);
        } else {
          console.error("No distro statuses found in API response");
        }
      } catch (error) {
        console.error("Error fetching mirror status from API:", error);

        // Try to fetch the static mirror-status.json file as a fallback
        try {
          console.log(
            "SyncStatusContext: Attempting to fetch static mirror-status.json as fallback",
          );
          const staticResponse = await fetch("/data/mirror-status.json");
          if (!staticResponse.ok) {
            throw new Error("Failed to fetch static mirror status");
          }

          const staticData = await staticResponse.json();

          // Use the distroStatuses from the static file
          if (staticData.distroStatuses) {
            setSyncStatuses(
              staticData.distroStatuses as Record<string, SyncStatus>,
            );
            console.log(
              "SyncStatusContext: Successfully loaded static mirror-status.json as fallback",
            );
          } else {
            console.error(
              "No distro statuses found in static mirror-status.json",
            );
            setSyncStatuses({});
          }
        } catch (fallbackErr) {
          console.error("Error fetching static mirror status:", fallbackErr);
          // Fallback to empty statuses if both fetches fail
          setSyncStatuses({});
        }
      }
    };

    fetchStatuses();
  }, []);

  return (
    <SyncStatusContext.Provider value={{ syncStatuses, updateSyncStatus }}>
      {children}
    </SyncStatusContext.Provider>
  );
};

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

  // Fetch the initial statuses from our mock JSON file
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch("/data/mirror-status.json");
        if (!response.ok) {
          throw new Error("Failed to fetch mirror status");
        }

        const data = await response.json();

        // Use the distroStatuses from our JSON file
        if (data.distroStatuses) {
          setSyncStatuses(data.distroStatuses as Record<string, SyncStatus>);
        } else {
          console.error("No distro statuses found in mirror-status.json");
        }
      } catch (error) {
        console.error("Error fetching mirror status:", error);
        // Fallback to empty statuses if fetch fails
        setSyncStatuses({});
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

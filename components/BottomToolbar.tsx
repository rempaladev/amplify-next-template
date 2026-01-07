import { SessionStatus } from "@/hooks/useRealtimeSession";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
}

function BottomToolbar({
    sessionStatus,
    onToggleConnection
}:BottomToolbarProps){

    const isConnected = sessionStatus === "CONNECTED";
    const isConnecting = sessionStatus === "CONNECTING";

    function getConnectionButtonClasses() {
        const baseClasses = "text-white text-base p-2 w-36 rounded-md h-full";
        const cursorClass = isConnecting ? "cursor-not-allowed" : "cursor-pointer";

        if (isConnected) {
        // Connected -> label "Disconnect" -> red
        return `bg-red-600 hover:bg-red-700 ${cursorClass} ${baseClasses}`;
        }
        // Disconnected or connecting -> label is either "Connect" or "Connecting" -> black
        return `bg-black hover:bg-gray-900 ${cursorClass} ${baseClasses}`;
    }

    function getConnectionButtonLabel() {
        if (isConnected) return "Disconnect";
        if (isConnecting) return "Connecting...";
        return "Connect";
    }

    return(
         <div className="sticky bottom-0 bg-transparent z-50">
            <div className="max-w-screen-md w-full mx-auto bg-white border-t px-2 sm:px-4 py-3 sm:py-4 flex flex-row items-center justify-center gap-x-8">
                <button
                    onClick={onToggleConnection}
                    className={getConnectionButtonClasses()}
                    disabled={isConnecting}
                >
                    {getConnectionButtonLabel()}
                </button>
            </div>
        </div>
    );
}

export default BottomToolbar;

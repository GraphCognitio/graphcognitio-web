import "./aero-fx.css";

export function BubbleLayer() {
    return (
        <div className="background-fx" aria-hidden="true">
            {/* Retro water bubbles */}
            <div className="bubble b-1" />
            <div className="bubble b-2" />
            <div className="bubble b-3" />
            <div className="bubble b-4" />
            <div className="bubble b-5" />

            {/* Pulsing Sparkles (Shines) */}
            <div className="sparkle s-1" />
            <div className="sparkle s-2" />
            <div className="sparkle s-3" />
            <div className="sparkle s-4" />
            <div className="sparkle s-5" />
        </div>
    );
}

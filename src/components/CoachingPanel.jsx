import { useEffect, useState } from "react";

const READING_MS = 8000;
const CONFIRM_MS = 2000;
const SOLAR_LEAD_IN_MS = 1000;

function CoachingPanel({ source, message, eventId, onDisplay }) {
  const [shown, setShown] = useState(() => ({ source, message, since: performance.now() }));

  useEffect(() => {
    if (shown.source === source && shown.message === message) return;
    const age = performance.now() - shown.since;
    const delay = shown.source === "fallback" && source === "solar"
      ? Math.max(0, SOLAR_LEAD_IN_MS - age)
      : Math.max(CONFIRM_MS, READING_MS - age);
    const timer = window.setTimeout(() => {
      setShown({ source, message, since: performance.now() });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [shown, source, message]);

  useEffect(() => {
    if (eventId) onDisplay(eventId, shown.source);
  }, [eventId, onDisplay, shown.source]);

  return (
    <section className="panel coaching-panel">
      <div className="panel-heading"><h2>최근 연습 안내</h2></div>
      <blockquote>
        <span aria-hidden="true">“</span>
        <p aria-live="polite" aria-atomic="true"><strong>[{shown.source === "solar" ? "SOLAR 응답" : "기본 안내"}]</strong> {shown.message}</p>
      </blockquote>
    </section>
  );
}
export default CoachingPanel;

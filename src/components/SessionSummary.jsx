function formatDuration(ms) {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const eventLabels = { forward_head_proxy: "머리·어깨 정렬 변화", forward_lean: "상체 전방 기울임", torso_lean: "상체 기울기", head_tilt: "머리 기울기", shoulder_height_difference: "어깨 균형", body_sway: "몸 흔들림", hand_placement: "손·무릎 배치", posture: "자세 변화" };

function SessionSummary({ mode, rubric, elapsedMs, stats, logs, feedback, onRestart }) {
  const frequent = Object.entries(stats.eventCounts).sort((a, b) => b[1] - a[1])[0];
  const longest = Object.entries(stats.issueDurations).sort((a, b) => b[1] - a[1])[0];
  const issueDuration = Object.values(stats.issueDurations).reduce((total, duration) => total + duration, 0);
  const eventRows = Object.entries(stats.eventCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(1, ...eventRows.map(([, count]) => count));
  const feedbackTitle = feedback.source === "solar" ? "SOLAR 종합 피드백" : "이번 연습 피드백";
  const localSummary = frequent
    ? `가장 자주 기록된 항목은 ‘${eventLabels[frequent[0]] || frequent[0]}’이며, 총 ${frequent[1]}회였습니다.`
    : "측정된 동안 주의·경고로 이어진 자세 변화는 없었습니다.";
  const feedbackText = {
    solar: feedback.message,
    loading: "SOLAR가 이번 연습의 자세 기록을 살펴보고 있습니다.",
    insufficient: "측정 시간이 짧아 전체 자세를 평가하기 어렵습니다. 다음 연습에서는 기준 자세를 잡은 뒤 3초 이상 측정을 이어가 주세요.",
    fallback: `SOLAR에 연결할 수 없어 측정 기록을 요약했습니다. ${localSummary}`,
  }[feedback.source];
  const postureTimeline = logs.filter((log) => ["CAUTION", "WARNING", "RECOVERED"].includes(log.status)).slice(-6);
  const sessionStart = logs.find((log) => log.status === "세션" && log.message.startsWith("분석 시작"));
  const sessionEnd = [...logs].reverse().find((log) => log.status === "세션" && log.message.startsWith("분석 종료"));
  const timeline = [
    sessionStart && { ...sessionStart, status: "START", message: "자세 감시 시작" },
    ...postureTimeline,
    sessionEnd && { ...sessionEnd, status: "END", message: "자세 감시 종료" },
  ].filter(Boolean);
  return (
    <section className="result-card">
      <div className="result-heading"><div><h2>분석 결과</h2><p>주요 자세변화와 코칭 결과를 확인하세요.</p></div><div className="result-mode"><span>분석 모드</span><strong>{mode.label}{mode.id === "interview" ? ` · 기준 ${rubric}` : ""}</strong></div></div>
      <div className="result-overview"><div><span>분석 시간</span><strong>{formatDuration(elapsedMs)}</strong></div><div><span>주의</span><strong>{stats.caution}회</strong></div><div><span>경고</span><strong>{stats.warning}회</strong></div><div><span>누적 이상 시간</span><strong>{(issueDuration / 1000).toFixed(1)}초</strong></div><div><span>항목별 최장 누적</span><strong>{longest ? `${(longest[1] / 1000).toFixed(1)}초` : "0.0초"}</strong></div><div><span>정상 복귀</span><strong>{stats.recovered}회</strong></div><div><span>주요 문제</span><strong>{frequent ? eventLabels[frequent[0]] || frequent[0] : "기록 없음"}</strong></div></div>
      <div className="result-detail-grid">
        <section className="result-statistics"><div className="result-section-title"><span>주요 분석 결과</span><small>기록된 문제별 횟수</small></div>{eventRows.length ? eventRows.map(([type, count]) => <div className="result-bar" key={type}><span>{eventLabels[type] || type}</span><i><b style={{ width: `${Math.max(8, count / maxCount * 100)}%` }} /></i><strong>{count}회</strong></div>) : <p className="result-empty">기록된 문제 자세 이벤트가 없습니다.</p>}</section>
        <section className="result-coaching"><div className="result-section-title"><span>{feedbackTitle}</span></div>
          <blockquote aria-live="polite">{feedbackText}</blockquote>
          <small>{feedback.displayedCount ? `실시간 주의·경고 안내 ${feedback.displayedCount}건 중 SOLAR 응답 ${feedback.solarCount}건` : "표시된 주의·경고 안내가 없습니다."}</small>
        </section>
      </div>
      <section className="result-timeline"><div className="result-section-title"><span>자세 변화 요약</span><small>감시 시작부터 종료까지</small></div>{timeline.length ? <ol>{timeline.map((log) => <li className={`timeline-${log.status.toLowerCase()}`} key={`${log.status}-${log.id}`}><time>{log.time}</time><span>{log.status === "START" ? "감시 시작" : log.status === "END" ? "감시 종료" : log.status}</span><p>{log.message}</p></li>)}</ol> : <p className="result-empty">표시할 자세 변화 기록이 없습니다.</p>}</section>
      <button className="primary-button result-action" type="button" onClick={onRestart}>다시 분석하기</button>
    </section>
  );
}
export default SessionSummary;

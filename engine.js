// StarDrill engine - STAR interview rehearsal logic (no DOM)
(function (root) {
  'use strict';

  var SEGMENTS = [
    { key: 'S', label: 'Situation', frac: 0.15, hint: 'Set the scene: where, when, who. Two sentences max.' },
    { key: 'T', label: 'Task', frac: 0.15, hint: 'Your specific responsibility or goal. One sentence.' },
    { key: 'A', label: 'Action', frac: 0.50, hint: 'What YOU did, step by step. This is the bulk - say "I", not "we".' },
    { key: 'R', label: 'Result', frac: 0.20, hint: 'The outcome, with numbers if you can. What changed, what you learned.' }
  ];

  var QUESTIONS = [
    { id: 'q1',  cat: 'Leadership', text: 'Tell me about a time you led a team through a difficult project.' },
    { id: 'q2',  cat: 'Leadership', text: 'Describe a time you had to motivate someone who was struggling.' },
    { id: 'q3',  cat: 'Conflict',   text: 'Tell me about a time you disagreed with a coworker. How did you handle it?' },
    { id: 'q4',  cat: 'Conflict',   text: 'Describe a situation where you had to push back on your manager.' },
    { id: 'q5',  cat: 'Failure',    text: 'Tell me about a time you failed. What did you learn?' },
    { id: 'q6',  cat: 'Failure',    text: 'Describe a mistake you made at work and how you fixed it.' },
    { id: 'q7',  cat: 'Teamwork',   text: 'Tell me about a time you helped a teammate succeed.' },
    { id: 'q8',  cat: 'Teamwork',   text: 'Describe a project where you had to work with a difficult personality.' },
    { id: 'q9',  cat: 'Initiative', text: 'Tell me about a time you went above and beyond your job description.' },
    { id: 'q10', cat: 'Initiative', text: 'Describe a problem you spotted and fixed before anyone asked you to.' },
    { id: 'q11', cat: 'Pressure',   text: 'Tell me about a time you worked under a tight deadline.' },
    { id: 'q12', cat: 'Pressure',   text: 'Describe a time you had to juggle multiple priorities at once.' },
    { id: 'q13', cat: 'Achievement', text: 'What is your proudest professional accomplishment?' },
    { id: 'q14', cat: 'Achievement', text: 'Tell me about a goal you set and how you reached it.' },
    { id: 'q15', cat: 'Adaptability', text: 'Tell me about a time plans changed suddenly. What did you do?' },
    { id: 'q16', cat: 'Adaptability', text: 'Describe a time you had to learn something new fast.' },
    { id: 'q17', cat: 'Communication', text: 'Tell me about a time you explained something complex to a non-expert.' },
    { id: 'q18', cat: 'Communication', text: 'Describe a time you had to deliver bad news.' },
    { id: 'q19', cat: 'Problem-solving', text: 'Tell me about the hardest problem you have solved at work.' },
    { id: 'q20', cat: 'Problem-solving', text: 'Describe a time you made a decision with incomplete information.' },
    { id: 'q21', cat: 'Customer',   text: 'Tell me about a time you turned around an unhappy customer or stakeholder.' },
    { id: 'q22', cat: 'Customer',   text: 'Describe a time you anticipated a need before it was raised.' },
    { id: 'q23', cat: 'Growth',     text: 'Tell me about feedback that stung but made you better.' },
    { id: 'q24', cat: 'Growth',     text: 'Describe a skill you deliberately built. How did you go about it?' }
  ];

  // Split totalSec into whole seconds per segment; largest remainder keeps the sum exact.
  function segmentPlan(totalSec) {
    if (!(totalSec >= 30)) throw new Error('total must be at least 30s');
    var raw = SEGMENTS.map(function (s) { return totalSec * s.frac; });
    var floors = raw.map(Math.floor);
    var left = totalSec - floors.reduce(function (a, b) { return a + b; }, 0);
    var order = raw.map(function (r, i) { return { i: i, rem: r - Math.floor(r) }; })
      .sort(function (a, b) { return b.rem - a.rem; });
    for (var k = 0; k < left; k++) floors[order[k].i]++;
    var start = 0;
    return SEGMENTS.map(function (s, i) {
      var seg = { key: s.key, label: s.label, hint: s.hint, seconds: floors[i], start: start, end: start + floors[i] };
      start = seg.end;
      return seg;
    });
  }

  // Where are we at elapsed seconds? Returns {index, segRemaining, elapsed_in_seg} or null when done.
  function segmentAt(plan, elapsed) {
    if (elapsed < 0) elapsed = 0;
    for (var i = 0; i < plan.length; i++) {
      if (elapsed < plan[i].end) {
        return { index: i, segRemaining: plan[i].end - elapsed, segElapsed: elapsed - plan[i].start };
      }
    }
    return null;
  }

  // Rubric: parts covered (booleans S/T/A/R) + clarity 1-5. Score 0-100.
  function scoreSession(parts, clarity) {
    var covered = ['S', 'T', 'A', 'R'].filter(function (k) { return parts[k]; }).length;
    var score = Math.round(covered * 17.5 + Math.max(1, Math.min(5, clarity)) * 6); // max 70+30
    return Math.min(100, score);
  }

  function scoreLabel(score) {
    if (score >= 85) return 'Interview-ready';
    if (score >= 65) return 'Solid - polish the weak parts';
    if (score >= 45) return 'Getting there - structure needs work';
    return 'Keep drilling';
  }

  // Coverage per question id: {count, lastTs, bestScore}
  function coverage(history) {
    var cov = {};
    history.forEach(function (h) {
      var c = cov[h.qid] || { count: 0, lastTs: 0, bestScore: 0 };
      c.count++;
      c.lastTs = Math.max(c.lastTs, h.ts);
      c.bestScore = Math.max(c.bestScore, h.score || 0);
      cov[h.qid] = c;
    });
    return cov;
  }

  // Suggest the next question: never-practiced first (oldest category variety), else least practiced / longest ago.
  function suggestNext(questions, history, excludeId) {
    var cov = coverage(history);
    var cand = questions.filter(function (q) { return q.id !== excludeId; });
    if (!cand.length) cand = questions.slice();
    cand.sort(function (a, b) {
      var ca = cov[a.id], cb = cov[b.id];
      var na = ca ? ca.count : 0, nb = cb ? cb.count : 0;
      if (na !== nb) return na - nb;
      var la = ca ? ca.lastTs : 0, lb = cb ? cb.lastTs : 0;
      return la - lb;
    });
    return cand[0];
  }

  var api = {
    SEGMENTS: SEGMENTS,
    QUESTIONS: QUESTIONS,
    segmentPlan: segmentPlan,
    segmentAt: segmentAt,
    scoreSession: scoreSession,
    scoreLabel: scoreLabel,
    coverage: coverage,
    suggestNext: suggestNext
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StarEngine = api;
})(typeof self !== 'undefined' ? self : this);

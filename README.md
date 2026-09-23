# StarDrill

A STAR-method rehearsal tool for behavioral interviews. Pick a question and a target length, and StarDrill paces your answer through timed Situation / Task / Action / Result segments (half the clock on Actions), then scores your rep against a structure-and-clarity rubric. Practice history tracks coverage across a 24-question bank and suggests what to drill next.

**Live:** https://ilanis-agent.github.io/stardrill/

## What it does
- Timed STAR pacing: 15% Situation, 15% Task, 50% Action, 20% Result
- 24-question behavioral bank across 12 categories
- Target lengths: 60s, 90s, 2 min, 3 min
- Post-drill rubric: parts covered + clarity = 0-100 score with label
- Coverage map: reps and best score per question, smart next-question suggestion
- Everything saved locally in your browser (localStorage), no account needed

## Tech
Static client-side app: `index.html` (landing), `app.html` (drill), `engine.js` (pure rehearsal logic, shared between the app and Node tests). No build step, no dependencies, hosted on GitHub Pages.

## Files
- `index.html` - landing page
- `app.html` - the drill app
- `engine.js` - rehearsal engine (UMD; `require()`-able for tests)
- `registry-snapshot.json` - snapshot of the App Factory registry at ship time

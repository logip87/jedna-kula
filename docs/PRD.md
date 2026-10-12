# PRD: Pétanque Training PWA

## 1. Product summary

Create a mobile-first web application for pétanque training, installable as a Progressive Web App (PWA).

The primary audience is adult pétanque players: recreational, club and tournament players, from beginners to advanced players. Juniors can comfortably use every feature.

The product is a modern sports training tool that develops versatility, decisions and mental habits across pointer, middle and shooter roles. Age never controls training access.

The application combines:

1. Mental training lessons.
2. Technical pétanque drills.
3. Guided training sessions.
4. Progress tracking.
5. Simple scoring and history.
6. PWA installation and offline use.

The UI language for MVP is Polish.

---

## 2. Product goals

The application should help a player:

- train regularly,
- learn correct mental habits,
- practice different pétanque roles,
- improve pointing, shooting and tactical flexibility,
- track progress over time,
- train independently without needing a coach at every session,
- avoid focusing only on shooting,
- develop a repeatable pre-shot routine.

The app should be simple, intuitive, fast, readable and mobile-first, with neutral sports language and a mature graphite, gold and cream interface.

---

## 3. Non-goals for MVP

Do NOT build in MVP:

- social network,
- public profiles,
- chat,
- payments,
- subscriptions,
- tournaments,
- live multiplayer,
- complex coach dashboard,
- cloud synchronization,
- authentication unless technically required,
- AI-generated coaching.

MVP should be local-first and work without an account.

---

## 4. Target devices

Primary:

- Android phone
- iPhone

Secondary:

- tablet
- desktop browser

The app must be responsive but designed mobile-first.

---

## 5. Technology recommendations

Preferred stack:

- React
- TypeScript
- Vite
- Tailwind CSS
- PWA plugin / service worker
- IndexedDB or localStorage for MVP data
- Vitest
- Playwright for E2E tests

Alternative:

- Next.js may be used if there is a clear technical advantage, but the app should remain simple and deployable as a static or low-cost web application.

PWA requirements:

- web app manifest,
- installable,
- application icon,
- standalone display mode,
- offline support,
- cached application shell,
- offline access to lessons and drills,
- graceful handling of unavailable network.

# 6. Core navigation

Bottom navigation on mobile:

1. Start
2. Trening
3. Lekcje
4. Postęp
5. Więcej

# 7. Home screen

The home screen should immediately show:

- "Dzisiejszy trening"
- suggested drill
- suggested mental lesson
- last training result
- recent saved results
- stronger and weaker areas in comparable conditions
- largest real progress when sufficient data exists
- current training streak
- shortcut: "Rozpocznij trening"

Example:

Dzisiejszy cel:
"Plan i powtarzalne wykonanie."

Recommended:

- Mental lesson: "Reset po błędzie"
- Technical drill: "Puenta na 7 metrów"

# 8. Mental training: five competencies

Build an original training system around competencies, rather than summarizing or adapting an article series. Do not reproduce a specific source's structure, ordering, slogans, examples or explanations.

The system includes 25 lessons, five per competency, and a practical module for every lesson:

- **Koncentracja**: Rutyna przed rzutem, Plan przed rzutem, Gdzie kieruję uwagę, Powrót do koncentracji, Koncentracja w długim turnieju.
- **Reset**: Reset po błędzie, Reset po sukcesie, Krótka analiza bez rozpamiętywania, Jak nie budować serii błędów, Zarządzanie energią mentalną.
- **Presja**: Co robić przed ważnym rzutem, Gra przy wysokim prowadzeniu, Gra przy wysokiej stracie, Mocny przeciwnik, Presja ostatniej kuli.
- **Pewność gry**: Zaufanie wytrenowanemu ruchowi, Nie poprawiaj wszystkiego w trakcie meczu, Pewność po słabszej serii, Dialog wewnętrzny w grze, Warunki do płynnej gry.
- **Zawodnik kompletny**: Zmiana roli w drużynie, Kiedy strzelać, a kiedy puentować, Jak pomagać drużynie, Komunikacja przed meną, Przygotowanie przed meczem.

Three freely accessible levels describe task difficulty:

1. **Podstawy**: concentration, routine and response to errors.
2. **Turniej**: pressure, score, opponents, weaker series and tactical decisions.
3. **Zaawansowane**: self-talk, conditions for flow, arousal regulation, long tournaments, mental energy and pre-match preparation.

Each lesson contains competency, level, title, explanation, rule, pétanque example, practical exercise and cue. Completion persists locally. Lists show progress by competency and across the program; competency and level filters are available. Details link to a matching practical module and technical training.

Routine for pointing, shooting and lobbing, also under pressure:

1. **PLAN**: choose the play and target.
2. **ODDECH**: comfortable exhale.
3. **WYKONANIE**: execute the trained movement.
4. **RESET**: record one fact and prepare the next task.

Practical modules take about two minutes, save every step and record before/after tension ratings (1–5). Lower tension is not required for completion. Ratings describe the player's experience rather than diagnose resilience. All levels remain available regardless of age or prior completion.

Technical sessions show cues appropriate to the throw, pressure and previous result. Shooting: “Ustal cel. Oddech. Rzut.”; pointing: “Najpierw wybierz miejsce lądowania.”; after a miss: “Reset i następne zadanie.”; after success: “Zachowaj tę samą rutynę.” Generator plans and pre-match training keep integrated mental stages.

# 9. Technical training categories

Create technical training library.

Main categories:

1. Puenta
2. Strzał
3. Lob
4. Gra przy linii
5. Różne odległości
6. Precyzja
7. Gra sytuacyjna
8. Trening mieszany

# 10. Pointing drills

## Drill: Puenta podstawowa

Distances: 6 m, 7 m, 8 m, 9 m, 10 m.
Player throws 6 balls per distance.

Scoring:

- 3 points: 0-30 cm from target
- 2 points: 31-60 cm
- 1 point: 61-100 cm
- 0 points: more than 100 cm

Store distance, score, accuracy percentage, date.

## Drill: Puenta na różne odległości

Random distances 6-10 m.
The application randomly chooses a new distance before each throw or series.
Goal: avoid repeating identical movement.

## Drill: Gra przy linii

Place target near side boundary.
Variants: 20 cm, 40 cm, 60 cm from line.
Train controlling direction and risk.
Record successful balls, balls outside line, average score.

## Drill: Puenta do celu

Targets: circle 30 cm, circle 50 cm, circle 100 cm.
Player chooses distance. Track hits.

# 11. Lob drills

## Drill: Lob podstawowy

Goal: throw high with controlled landing point.
Distances: 6 m, 7 m, 8 m, 9 m.
Landing zone: 50 cm target circle.
Measure landing accuracy and final ball position.

## Drill: Lob nad przeszkodą

Simulated obstacle between circle and target.
Examples: ball cluster, rope, training marker.
Goal: land behind obstacle.

# 12. Shooting drills

## Drill: Strzał podstawowy

Distances: 6 m, 7 m, 8 m, 9 m, 10 m.
6 attempts per distance.

Scoring suggestion:

- 5 points: carreau
- 3 points: direct hit / target removed
- 1 point: target touched but remains
- 0 points: miss

## Drill: Strzał seryjny

10 consecutive shots.
Track hits, misses, carreaux.

## Drill: Strzał po zmianie odległości

Random order: 6 m, 8 m, 7 m, 9 m, 10 m.
The player does not repeat the same distance.

## Drill: Strzał pod presją

Example challenge: need 3 hits in 5 attempts.
If failed, repeat series.
Mental phrase shown: "Ustal cel. Oddech. Rzut."

# 13. Mixed training

## Trening kompletny 30 min

- 5 minutes warm-up
- 10 minutes pointing
- 10 minutes shooting
- 5 minutes mental exercise

## Strzelec + puenter

- Round 1: pointing
- Round 2: shooting
- Round 3: random role
- Round 4: situational play

# 14. Situational training

Keep tactical boards and the existing match simulator. Expand the shared throw engine with seven selectable situations:

- opponent has point,
- opponent has two scoring boules,
- player has one boule,
- opponent has no boules,
- player leads 12:10,
- player trails 4:11,
- last boule of the end.

The player sees the situation and sets it up on the court, chooses a decision, executes the throw, records its outcome and optionally evaluates the decision independently of execution. The choice persists before throwing. Scenario IDs, decisions and optional reviews persist in drafts, history and backups. Select a rotating set or one repeated situation. Mixed training uses the same scenarios in its situational phase.

No automatic tactical scoring or complex tactical engine in MVP. The match simulator records declared points; tactical boards explain risks and alternatives.

# 15. Training session flow

1. Select training type.
2. Select difficulty: łatwy / średni / trudny.
3. Show instructions.
4. Start session.
5. During session show current exercise, throw number, distance, current score and short mental cue.
6. Finish session.
7. Show summary.

Example active session:
Rzut 4 / 10
Odległość: 8 m
Mental cue: "Ustal cel. Oddech. Rzut."

# 16. Session summary

Display:

- total score,
- percentage,
- best distance,
- weakest distance,
- hits,
- misses,
- carreaux if relevant,
- short mental self-assessment.

Ask:
"Jak czułeś się podczas treningu?"
Options: spokojnie / normalnie / zestresowany / bardzo zestresowany.

Optional question:
"Czy po błędzie wracałeś do następnej kuli?"
Options: tak / czasami / nie.

# 17. Progress screen

Show simple statistics.

Technical:

- pointing accuracy,
- shooting accuracy,
- carreau percentage,
- accuracy by distance,
- results over time.

Mental:

- completed lessons,
- completed mental exercises,
- percentage of sessions where routine was used.

Avoid overly complex charts. Use simple mobile-friendly cards and line charts.

# 18. Player profile

Profile remains optional and local:

- name / display name,
- optional age with no prefilled value,
- level: początkujący / średniozaawansowany / zaawansowany / turniejowy,
- preferred role: pointer / middle / shooter / wszechstronny,
- dominant hand.

Age and preferred role never lock training features. Level adjusts presentation; conditions remain selectable. Juniors and adults share the product. Short and standard training series are selected by workload, not age. Legacy audience fields remain readable for compatibility.

# 19. Gamification

Use light gamification.

Possible achievements:

- Pierwszy trening
- 5 treningów
- 10 treningów
- 3 dni z rzędu
- 10 trafień
- 5 carreaux
- Puenta 30 cm
- Trening na 10 m
- Wszechstronny zawodnik
- Zaliczone wszystkie lekcje mentalne

Use sports achievements: regularity, personal records, distance progress, completed plans and new maxima. Keep earned marks. No coins, childish stars or cartoon rewards; the purpose is regular practice.

# 20. Offline requirements

The following must work offline:

- app launch,
- mental lessons,
- training library,
- starting a session,
- saving results,
- viewing local history.

Data should persist in browser storage. No data loss after app restart.

# 21. PWA install

Application must:

- have valid manifest,
- use standalone display,
- contain app icons,
- provide theme color,
- support Add to Home Screen,
- work in portrait orientation,
- work offline after first load.

Add custom UI hint "Zainstaluj aplikację" only when installation is available.

# 22. Accessibility and sports UX

Requirements:

- large touch targets,
- readable fonts,
- simple Polish,
- no long paragraphs during active training,
- no tiny controls,
- no important action accessible only by swipe,
- clear confirmation before deleting training history,
- strong contrast.

# 23. Data model

## Player

id, name, age?, level?, preferredRole, preferredHand, createdAt

## MentalLesson

id, competency, level, title, description, rule, example, exercise, phrase; completed IDs in State.lessons

## Drill

id, name, category, description, difficulty, distanceOptions, scoringRules

## TrainingSession

id, drillId, startedAt, completedAt, score, attempts, results, stressLevel, routineUsed

## Attempt

id, sessionId, distance, result, points, notes

## Achievement

id, name, description, unlockedAt

# 24. Suggested folder structure

src/
app/
components/
features/
home/
drills/
mental/
progress/
profile/
data/
hooks/
lib/
services/
storage/
types/
pwa/

tests/
unit/
e2e/

# 25. Testing requirements

Use unit tests for:

- scoring,
- progress calculations,
- achievements,
- storage.

Use Playwright for critical user paths.

Required E2E tests:

1. Open application.
2. Start pointing training.
3. Record throws.
4. Finish session.
5. Verify result saved.
6. Open progress screen.
7. Complete mental lesson.
8. Reload application.
9. Verify data persists.
10. Verify offline app shell loads.

# 26. MVP screens

Required screens:

1. Home
2. Training library
3. Training detail
4. Active training session
5. Training summary
6. Mental lessons list
7. Mental lesson detail
8. Progress
9. History
10. Player profile
11. Settings

# 27. MVP completion criteria

The MVP is complete when:

- user can install the app as PWA,
- app works offline,
- user can train five competencies across three levels through 25 lessons and practical modules,
- user can run pointing training,
- user can run shooting training,
- user can run lob training,
- user can train at multiple distances,
- user can train near boundary line,
- training results are stored locally,
- progress is visible,
- data survives refresh and application restart,
- core flows have Playwright tests,
- application works well on mobile screens.

# 28. Implementation plan

## Phase 1: Foundation

Tasks:

- initialize React + TypeScript project,
- add Tailwind,
- configure routing,
- create mobile layout,
- configure PWA manifest,
- configure service worker,
- configure local persistence,
- create data models,
- add Vitest,
- add Playwright.
  Acceptance: app loads, navigation works, app installable, offline shell works.

## Phase 2: Mental training

Tasks:

- create mental lesson model,
- add 25 lessons grouped by competency and level,
- lesson list,
- lesson detail,
- mark lesson completed,
- save progress.
  Acceptance: lesson progress persists after restart.

## Phase 3: Technical drill engine

Tasks:

- generic drill model,
- pointing drills,
- shooting drills,
- lob drills,
- distance drills,
- boundary-line drills.
  Acceptance: drills reuse common session engine.

## Phase 4: Active training

Tasks:

- session start,
- attempt counter,
- scoring,
- distance selection,
- random distance mode,
- mental cue,
- finish session.
  Acceptance: full training can be completed without page reload.

## Phase 5: Progress

Tasks:

- history,
- stats,
- accuracy,
- results by distance,
- mental progress,
- achievements.

## Phase 6: UX polish

Tasks:

- neutral sports UI,
- responsive layout,
- accessibility,
- PWA install prompt,
- offline state,
- empty states,
- onboarding.

# 29. Future roadmap

Possible later features:

- user accounts,
- cloud sync,
- coach profile,
- team mode,
- coach-created training plans,
- video upload,
- AI-assisted analysis,
- tournament mode,
- push notifications,
- training reminders,
- shared progress with coach,
- custom drills.

These must NOT block MVP.

# 30. Product principle

The most important principle of the app:

The player should not only become better at throwing a boule.
The player should become better at deciding, focusing, recovering after mistakes, changing roles, handling pressure, and repeating good habits.

Core mental routine:
"Plan. Oddech. Wykonanie. Reset."

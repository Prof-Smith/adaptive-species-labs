# Adaptive Species Labs

**Adaptive Species Labs** is a static companion site for *The Adaptive Species*. It contains interactive classroom labs designed to help students see adaptive judgment in action. Each lab is a small decision world where students adjust conditions, observe system behavior, interpret dashboard feedback, and connect the pattern to a broader decision principle.

The site is designed for use in finance, economics, behavioral economics, decision science, AI literacy, strategy, and interdisciplinary courses on uncertainty and adaptation.

## Core teaching idea

The labs are built around a simple instructional rhythm:

1. **Run** the default state.
2. **Change** one condition at a time.
3. **Stress** the system with a shock, crisis, shortcut, or alternate scenario.
4. **Interpret** the dashboard as a guide, not a grade.
5. **Transfer** the pattern to real decisions, organizations, tools, and lives.

The goal is not to produce one correct answer. The goal is to help students notice how judgment changes when uncertainty, incentives, models, attention, cooperation, AI, institutions, and feedback change.

## Learning arc

The homepage organizes the labs into four learning arcs, each with direct chapter links.

### The Individual Decision

These labs focus on how people decide, distort, learn, and explain under uncertainty.

- **Chapter 1: Decision in the Fog**
- **Chapter 2: Bias Weather Map**
- **Chapter 3: The Hindsight Machine**
- **Chapter 5: Narrative Trap Machine**

### Adaptive Systems

These labs focus on environments, agents, attention, prediction, and repeated games.

- **Chapter 4: Fitness Landscape Explorer**
- **Chapter 6: Prediction Under Change**
- **Chapter 7: Attention Allocation Simulator**
- **Chapter 8: Cooperation Under Selection**

### Institutions, Tools, and Futures

These labs focus on models, institutions, optionality, and AI workflows.

- **Chapter 9: Model Drift Dashboard**
- **Chapter 10: Institutional Inertia Simulator**
- **Chapter 11: Optionality Portfolio Lab**
- **Chapter 12: WAIT Before You Trust**

### Capstone

These labs help students map unknowns and build a personal or institutional adaptive system.

- **Chapter 13: Ignorance Inventory**
- **Chapter 14: Adaptive Life Map**

## Lab catalog

| Chapter | Lab | Adaptive focus |
|---:|---|---|
| 1 | Decision in the Fog | Acting before certainty while separating process quality from outcome quality |
| 2 | Bias Weather Map | Seeing bias as partly ecological, not only individual |
| 3 | The Hindsight Machine | Learning from outcomes without letting hindsight rewrite uncertainty |
| 4 | Fitness Landscape Explorer | Balancing exploitation, exploration, local peaks, and environmental shocks |
| 5 | Narrative Trap Machine | Using stories without mistaking coherence for evidence |
| 6 | Prediction Under Change | Comparing random, reactive, and predictive agents in a moving environment |
| 7 | Attention Allocation Simulator | Allocating scarce attention among signal, noise, salience, and urgency |
| 8 | Cooperation Under Selection | Testing repeated-game strategies in an Axelrod-style ecology |
| 9 | Model Drift Dashboard | Detecting when a useful model stops matching its world |
| 10 | Institutional Inertia Simulator | Moving signals through institutional friction before the opportunity window closes |
| 11 | Optionality Portfolio Lab | Balancing safety, upside, flexibility, and commitment across uncertain futures |
| 12 | WAIT Before You Trust | Using AI to extend judgment without evacuating skill |
| 13 | Ignorance Inventory | Turning unknowns into tests, triggers, and monitoring priorities |
| 14 | Adaptive Life Map | Building a system of sensing, deciding, acting, learning, and renewal |

## Page structure

Each lab follows a common instructional structure:

- **Hero section** with chapter title, lab title, and lab rule
- **The Question** to frame the adaptive problem
- **How to use this lab** with a five-step classroom rhythm
- **Pedagogical spine** with:
  - Adaptive problem
  - Misconception challenged
  - Transfer target
- **How to interpret this lab** block
- **Quick mode** and **Deep mode**
- **Controls** for changing the environment
- **Simulation / visualization**
- **Dashboard metrics**
- **Reflection prompts**
- **Chapter connection**

## Quick mode and deep mode

Each lab supports two classroom styles.

### Quick mode

Use quick mode for short demonstrations. Run the default, trigger one stress test or scenario, and ask students what changed.

### Deep mode

Use deep mode for longer activities or assignments. Students compare at least two different environments, interpret dashboard changes, and complete reflection prompts.

## Design system

The site uses a consistent visual language:

| Color | Common meaning |
|---|---|
| Blue | Signal, knowledge, human judgment, current reality |
| Orange | Story, friction, temptation, adaptation pressure, AI output |
| Green | Learning, cooperation, resilience, successful adaptation |
| Red | Risk, fragility, failure, uninspected danger |
| Gray | Noise, uncertainty, missing information |
| Purple | Review, transfer, system structure |

The layout uses shared panels, metric cards, legends, control sections, and reflection blocks across the labs.

## Technical overview

This is a static site built with:

- HTML
- CSS
- JavaScript
- Canvas-based visualizations

No build system is required. The site can run locally by opening `index.html` in a browser, or it can be deployed as a static site through GitHub Pages.

## File structure

```text
adaptive-species-labs-site/
├── index.html
├── styles.css
├── app-common.js
├── README.md
├── .nojekyll
├── .github/
│   └── workflows/
│       └── pages.yml
└── labs/
    ├── decision-in-the-fog/
    ├── bias-weather-map/
    ├── hindsight-machine/
    ├── fitness-landscape/
    ├── narrative-trap-machine/
    ├── prediction-under-change/
    ├── attention-allocation/
    ├── axelrod-cooperation/
    ├── model-drift-dashboard/
    ├── institutional-inertia/
    ├── optionality-portfolio/
    ├── wait-before-you-trust/
    ├── ignorance-inventory/
    └── adaptive-life-map/
```

## Deployment

The repository includes a GitHub Pages workflow at:

```text
.github/workflows/pages.yml
```

The workflow is configured to deploy the static site from the repository root when changes are pushed to the `main` branch or when the workflow is triggered manually.

## Quality checks performed

The most recent revision pass included:

- JavaScript syntax checks across lab scripts
- Internal link checks across homepage and lab pages
- Homepage section checks
- Lab-flow checks across all lab pages
- Pedagogy-panel checks across all lab pages
- Navigation standardization across lab pages
- Mobile readability and responsive layout improvements

## Navigation model

The homepage provides:

- Intro
- Labs
- Start Chapter 1
- Capstone

Each lab page uses a simplified navigation model:

```text
Home | Previous Chapter | Next Chapter | All labs
```

This keeps individual lab pages from becoming crowded while still preserving the chapter sequence.

## Revision history

### Repair pass

- Corrected Chapter 3’s broken visualization.
- Restored Chapter 6’s Arcas-inspired Prediction Under Change simulation.
- Restored Chapter 8’s Axelrod-style Cooperation Under Selection simulation.
- Standardized lab navigation.

### Pass 2: Design system

- Added common lab structure.
- Standardized dashboard styling.
- Standardized legends.
- Improved mobile layout.
- Increased consistency across panels, metrics, controls, and reflection sections.

### Pass 3: Pedagogy

- Added adaptive problem, misconception challenged, and transfer target to every lab.
- Added “How to interpret this lab” blocks.
- Added quick mode and deep mode.
- Tightened reflection prompts.

### Pass 4: Homepage and sequencing

- Replaced index-like homepage organization with a learning arc.
- Added instructor-facing overview.
- Improved lab cards and learning-arc tiles.
- Fixed homepage arc links and tightened tile spacing.
- Separated homepage chapter labels and learning-arc labels onto distinct lines.
- Increased font size and spacing for readability.
- Ran final QA checks.

## Suggested next revision

A useful next pass would be a **lab-by-lab polish pass** focused on visual refinement and classroom testing. Recommended priorities:

1. Test each simulation live in a browser.
2. Simplify any crowded control panels.
3. Improve any canvas legends that are hard to read on projection.
4. Add downloadable instructor prompts or assignment sheets if needed.
5. Consider grouping the lab cards by learning arc visually on the homepage.

## Project note

This site is intended as a teaching companion, not as a deterministic scoring engine. The dashboard metrics are interpretive aids. Students should use the simulations to reason about tradeoffs, observe adaptive patterns, and transfer the lessons to real decisions.

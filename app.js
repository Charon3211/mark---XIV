const STORAGE_KEY = "pulse-workout-tracker-v1";

const schedule = [
  {
    key: "monday",
    day: "Monday",
    short: "Mon",
    type: "Push",
    description: "Pressing strength, shoulders and triceps.",
    exercises: [
      ["Bench Press (Barbell)", 3, "6-10"],
      ["Shoulder Press (Dumbbell)", 3, "8-12"],
      ["Low Cable Fly Crossovers", 3, "12-15"],
      ["Triceps Extension (Dumbbell)", 3, "12-15"],
      ["Triceps Rope Pushdown", 3, "12-15"]
    ]
  },
  {
    key: "tuesday",
    day: "Tuesday",
    short: "Tue",
    type: "Pull",
    description: "Back thickness, lats, biceps and rear delts.",
    exercises: [
      ["Bent Over Row (Barbell)", 3, "6-10"],
      ["Lat Pulldown (Cable)", 3, "8-12"],
      ["Bicep Curl (Dumbbell)", 3, "12-15"],
      ["Hammer Curl (Dumbbell)", 3, "12-15"],
      ["Face Pull", 3, "15-25"]
    ]
  },
  {
    key: "wednesday",
    day: "Wednesday",
    short: "Wed",
    type: "Legs",
    description: "Squat pattern, posterior chain and calves.",
    exercises: [
      ["Squat (Barbell)", 3, "6-10"],
      ["Glute Ham Raise", 3, "8-12"],
      ["Lunge (Dumbbell)", 3, "10-15"],
      ["Lying Leg Curl (Machine)", 3, "12-15"],
      ["Standing Calf Raise (Smith)", 3, "8-12"]
    ]
  },
  {
    key: "thursday",
    day: "Thursday",
    short: "Thu",
    type: "Upper",
    description: "Balanced upper-body strength and volume.",
    exercises: [
      ["Pull Up", 3, "5-10"],
      ["Incline Bench Press (Dumbbell)", 3, "8-10"],
      ["Straight Arm Lat Pulldown (Cable)", 3, "10-15"],
      ["Seated Shoulder Press (Machine)", 3, "10-12"],
      ["Push Up", 2, "10-20"]
    ]
  },
  {
    key: "friday",
    day: "Friday",
    short: "Fri",
    type: "Off",
    description: "Recovery day. No lifting required.",
    exercises: []
  },
  {
    key: "saturday",
    day: "Saturday",
    short: "Sat",
    type: "Lower",
    description: "Lower-body strength, conditioning and trunk work.",
    exercises: [
      ["Leg Press (Machine)", 3, "8-12"],
      ["Romanian Deadlift (Barbell)", 3, "8-10"],
      ["Leg Extension (Machine)", 3, "12-15"],
      ["Seated Calf Raise", 4, "12-20"],
      ["Cable Crunch", 4, "12-15"],
      ["DB Thrusters", 4, "15"],
      ["DB Goblet Swings", 4, "20"],
      ["Cable Woodchoppers (high-to-low, one side)", 4, "15 per side"],
      ["Cable Pull-throughs", 4, "15"],
      ["DB Renegade Row + Push-up", 4, "8 per side"],
      ["DB Man-makers", 3, "8"]
    ]
  },
  {
    key: "sunday",
    day: "Sunday",
    short: "Sun",
    type: "Cardio",
    description: "Conditioning circuit with full-body movement.",
    exercises: [
      ["DB Thrusters", 4, "15"],
      ["DB Goblet Swings", 4, "20"],
      ["Cable Woodchoppers (high-to-low, one side)", 4, "15 per side"],
      ["Cable Pull-throughs", 4, "15"],
      ["DB Renegade Row + Push-up", 4, "8 per side"],
      ["DB Man-makers", 3, "8"]
    ]
  }
];

const todayIndex = (new Date().getDay() + 6) % 7; // JS Sunday=0 -> Monday=0
let selectedIndex = todayIndex;
let state = loadState();

const els = {
  todayLabel: document.getElementById("todayLabel"),
  dayTitle: document.getElementById("dayTitle"),
  dayDescription: document.getElementById("dayDescription"),
  weeklyProgressText: document.getElementById("weeklyProgressText"),
  weeklyProgressBar: document.getElementById("weeklyProgressBar"),
  weeklyProgressDetail: document.getElementById("weeklyProgressDetail"),
  dayNav: document.getElementById("dayNav"),
  sessionCount: document.getElementById("sessionCount"),
  sessionProgressBar: document.getElementById("sessionProgressBar"),
  sessionPercent: document.getElementById("sessionPercent"),
  workoutHeading: document.getElementById("workoutHeading"),
  exerciseList: document.getElementById("exerciseList"),
  completeBanner: document.getElementById("completeBanner"),
  toastRegion: document.getElementById("toastRegion"),
  saveStatus: document.getElementById("saveStatus"),
  resetWeekBtn: document.getElementById("resetWeekBtn"),
  celebrationLayer: document.getElementById("celebrationLayer")
};

function blankDay(day) {
  return {
    manual: Array(day.exercises.length).fill(false),
    sets: day.exercises.map(([, count]) => Array(count).fill(false))
  };
}

function defaultState() {
  return {
    version: 1,
    days: schedule.map(blankDay),
    selectedIndex: todayIndex
  };
}

function normaliseState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;

  const result = {
    version: 1,
    days: schedule.map((day, i) => {
      const incoming = raw.days?.[i] ?? {};
      const blank = blankDay(day);

      const manual = Array.isArray(incoming.manual)
        ? blank.manual.map((_, j) => Boolean(incoming.manual[j]))
        : blank.manual;

      const sets = day.exercises.map(([, count], exerciseIndex) => {
        const incomingSets = Array.isArray(incoming.sets?.[exerciseIndex])
          ? incoming.sets[exerciseIndex]
          : [];
        return Array.from({ length: count }, (_, setIndex) =>
          Boolean(incomingSets[setIndex])
        );
      });

      return { manual, sets };
    }),
    selectedIndex: Number.isInteger(raw.selectedIndex)
      ? Math.min(Math.max(raw.selectedIndex, 0), schedule.length - 1)
      : todayIndex
  };

  return result;
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return normaliseState(raw);
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setSaveStatus("Saved just now");
}

let saveTimer;
function setSaveStatus(text) {
  els.saveStatus.textContent = text;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    els.saveStatus.textContent = "Saved locally";
  }, 1800);
}

function daySetCount(dayIndex) {
  const day = schedule[dayIndex];
  const dayState = state.days[dayIndex];
  const totalSets = day.exercises.reduce((sum, [, count]) => sum + count, 0);
  const loggedSets = dayState.sets.reduce(
    (sum, sets) => sum + sets.filter(Boolean).length,
    0
  );
  return { totalSets, loggedSets };
}

function exerciseComplete(dayIndex, exerciseIndex) {
  const day = schedule[dayIndex];
  const dayState = state.days[dayIndex];
  if (dayState.manual[exerciseIndex]) return true;

  const sets = dayState.sets[exerciseIndex];
  return sets.length > 0 && sets.every(Boolean);
}

function dayComplete(dayIndex) {
  const day = schedule[dayIndex];
  if (day.type === "Off") return true;

  return day.exercises.every((_, exerciseIndex) =>
    exerciseComplete(dayIndex, exerciseIndex)
  );
}

function weeklyCompletion() {
  const workDays = schedule.filter(day => day.type !== "Off").length;
  const completed = schedule.reduce(
    (sum, day, index) =>
      sum + (day.type !== "Off" && dayComplete(index) ? 1 : 0),
    0
  );
  return {
    completed,
    total: workDays,
    percent: workDays ? Math.round((completed / workDays) * 100) : 100
  };
}

function sessionStats(dayIndex) {
  const day = schedule[dayIndex];
  if (!day.exercises.length) return { completed: 1, total: 1, percent: 100 };

  const completed = day.exercises.reduce(
    (sum, _, exerciseIndex) =>
      sum + (exerciseComplete(dayIndex, exerciseIndex) ? 1 : 0),
    0
  );

  return {
    completed,
    total: day.exercises.length,
    percent: Math.round((completed / day.exercises.length) * 100)
  };
}

function renderDayNav() {
  els.dayNav.innerHTML = schedule.map((day, index) => {
    const selected = index === selectedIndex;
    const complete = dayComplete(index);

    return `
      <button
        class="day-button ${selected ? "is-selected" : ""} ${complete ? "is-complete" : ""}"
        data-day-index="${index}"
        type="button"
        aria-current="${selected ? "page" : "false"}"
      >
        <span class="day-state-dot" aria-hidden="true"></span>
        <span class="day-top">${day.short}</span>
        <span class="day-name">${day.type}</span>
      </button>
    `;
  }).join("");
}

function renderExerciseList() {
  const day = schedule[selectedIndex];
  const dayState = state.days[selectedIndex];

  if (!day.exercises.length) {
    els.exerciseList.innerHTML = `
      <div class="exercise-card" style="display:block; text-align:center; padding:34px 20px;">
        <p class="section-kicker">RECOVERY</p>
        <h3 style="margin:8px 0 6px; font-size:18px;">Off day</h3>
        <p style="margin:0; color:var(--muted); font-size:12px; line-height:1.6;">
          Take the day to recover, sleep well and come back ready.
        </p>
      </div>
    `;
    return;
  }

  els.exerciseList.innerHTML = day.exercises.map(([name, setCount, reps], exerciseIndex) => {
    const sets = dayState.sets[exerciseIndex];
    const complete = exerciseComplete(selectedIndex, exerciseIndex);

    return `
      <article class="exercise-card ${complete ? "is-complete" : ""}" data-exercise-index="${exerciseIndex}">
        <div class="exercise-main">
          <div class="exercise-title-row">
            <h3 class="exercise-name">${escapeHTML(name)}</h3>
            <span class="completion-stamp">✓ complete</span>
          </div>
          <p class="exercise-detail">${setCount} sets × ${reps} reps</p>

          <button class="exercise-complete-toggle" type="button" data-action="toggle-exercise">
            <span class="exercise-check">✓</span>
            <span>${complete ? "Completed" : "Mark complete"}</span>
          </button>
        </div>

        <div class="sets" aria-label="${escapeHTML(name)} set tracker">
          ${sets.map((logged, setIndex) => `
            <button
              class="set-button ${logged ? "is-logged" : ""}"
              type="button"
              data-action="toggle-set"
              data-set-index="${setIndex}"
              aria-label="Set ${setIndex + 1}: ${logged ? "completed" : "not completed"}"
              aria-pressed="${logged}"
            >
              <span class="set-label">S${setIndex + 1}</span>
            </button>
          `).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function renderAll() {
  const day = schedule[selectedIndex];
  const stats = sessionStats(selectedIndex);
  const weekly = weeklyCompletion();

  els.todayLabel.textContent = indexToLabel(selectedIndex === todayIndex ? "TODAY" : day.day.toUpperCase());
  els.dayTitle.textContent = day.type;
  els.dayDescription.textContent = day.description;
  els.workoutHeading.textContent = `${day.type} day`;

  els.sessionCount.textContent = day.exercises.length
    ? `${stats.completed} / ${stats.total} exercises`
    : "Recovery day";

  els.sessionProgressBar.style.width = `${stats.percent}%`;
  els.sessionPercent.textContent = `${stats.percent}%`;

  els.weeklyProgressText.textContent = `${weekly.percent}%`;
  els.weeklyProgressBar.style.width = `${weekly.percent}%`;
  els.weeklyProgressDetail.textContent =
    `${weekly.completed} of ${weekly.total} training days complete`;

  els.completeBanner.classList.toggle("is-visible", dayComplete(selectedIndex) && day.type !== "Off");

  renderDayNav();
  renderExerciseList();
}

function indexToLabel(value) {
  return value === "TODAY" ? "TODAY" : value;
}

function navigateToDay(nextIndex) {
  if (nextIndex === selectedIndex) return;

  const oldIndex = selectedIndex;
  const direction = nextIndex > oldIndex ? 1 : -1;

  selectedIndex = nextIndex;
  state.selectedIndex = selectedIndex;

  els.workoutPanel?.classList.remove("is-entering");
  els.workoutPanel?.classList.add("is-transitioning");

  window.setTimeout(() => {
    renderAll();
    els.workoutPanel?.classList.remove("is-transitioning");
    requestAnimationFrame(() => {
      els.workoutPanel?.classList.add("is-entering");
    });
  }, 165);

  // Pre-render top-level content immediately so the day feels responsive.
  els.dayTitle.textContent = schedule[nextIndex].type;
  els.dayDescription.textContent = schedule[nextIndex].description;

  if (direction === 0) return;
}

function toggleSet(exerciseIndex, setIndex) {
  const sets = state.days[selectedIndex].sets[exerciseIndex];
  const wasComplete = exerciseComplete(selectedIndex, exerciseIndex);

  sets[setIndex] = !sets[setIndex];

  // Auto-complete when all sets are logged.
  state.days[selectedIndex].manual[exerciseIndex] = false;

  saveState();
  renderAll();

  const nowComplete = exerciseComplete(selectedIndex, exerciseIndex);

  if (nowComplete && !wasComplete) {
    celebrate("Exercise complete");
  } else {
    microFeedback();
  }
}

function toggleExercise(exerciseIndex) {
  const before = exerciseComplete(selectedIndex, exerciseIndex);
  const dayState = state.days[selectedIndex];
  dayState.manual[exerciseIndex] = !before;

  // When manually marking complete, mark every set as done for coherent state.
  if (!before) {
    dayState.sets[exerciseIndex] = dayState.sets[exerciseIndex].map(() => true);
  } else {
    dayState.sets[exerciseIndex] = dayState.sets[exerciseIndex].map(() => false);
  }

  saveState();
  renderAll();

  if (!before) celebrate("Exercise complete");
  else microFeedback();
}

function celebrate(message) {
  showToast(`${message} — saved automatically`);
  els.celebrationLayer.classList.remove("is-active");
  void els.celebrationLayer.offsetWidth;
  els.celebrationLayer.classList.add("is-active");

  window.setTimeout(() => {
    els.celebrationLayer.classList.remove("is-active");
  }, 850);
}

function microFeedback() {
  showToast("Set updated");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  els.toastRegion.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 360);
  }, 1100);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resetWeek() {
  const ok = window.confirm(
    "Reset every saved set and completion state for the week?"
  );
  if (!ok) return;

  state = defaultState();
  selectedIndex = todayIndex;
  saveState();
  renderAll();
  showToast("Week reset");
}

els.dayNav.addEventListener("click", event => {
  const button = event.target.closest("[data-day-index]");
  if (!button) return;
  navigateToDay(Number(button.dataset.dayIndex));
});

els.exerciseList.addEventListener("click", event => {
  const exerciseCard = event.target.closest("[data-exercise-index]");
  if (!exerciseCard) return;

  const exerciseIndex = Number(exerciseCard.dataset.exerciseIndex);
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) return;

  if (actionButton.dataset.action === "toggle-set") {
    toggleSet(exerciseIndex, Number(actionButton.dataset.setIndex));
  }

  if (actionButton.dataset.action === "toggle-exercise") {
    toggleExercise(exerciseIndex);
  }
});

els.resetWeekBtn.addEventListener("click", resetWeek);

// Expose the panel node after DOM lookup for transition helpers.
els.workoutPanel = document.querySelector(".workout-panel");

renderAll();

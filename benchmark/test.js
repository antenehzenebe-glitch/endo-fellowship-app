const fs = require('fs');

// Generate large mock data
const NUM_FELLOWS = 500;
const NUM_TASKS_PER_FELLOW = 100;

const fellows = Array.from({ length: NUM_FELLOWS }, (_, i) => ({
  id: `fellow-${i}`,
  full_name: `Fellow ${i}`,
  pgy_level: i % 2 === 0 ? 'PGY-4' : 'PGY-5',
}));

const onboarding = [];
for (let i = 0; i < NUM_FELLOWS; i++) {
  for (let j = 0; j < NUM_TASKS_PER_FELLOW; j++) {
    onboarding.push({
      fellow_id: `fellow-${i}`,
      status: j % 2 === 0 ? 'completed' : 'pending',
    });
  }
}

console.log(`Generated ${NUM_FELLOWS} fellows and ${onboarding.length} onboarding tasks.`);

function runBaseline() {
  const start = performance.now();
  const results = fellows.map((fellow) => {
    const fellowTasks = onboarding.filter((o) => o.fellow_id === fellow.id);
    const onboardingTotal = fellowTasks.length;
    const onboardingDone = fellowTasks.filter((o) => o.status === 'completed').length;
    return {
      onboardingTotal,
      onboardingDone,
    };
  });
  const end = performance.now();
  return end - start;
}

function runOptimized() {
  const start = performance.now();
  // Simulated optimized code
  const onboardingByFellow = new Map();
  for (let i = 0; i < onboarding.length; i++) {
    const o = onboarding[i];
    let counts = onboardingByFellow.get(o.fellow_id);
    if (!counts) {
      counts = { total: 0, done: 0 };
      onboardingByFellow.set(o.fellow_id, counts);
    }
    counts.total++;
    if (o.status === 'completed') counts.done++;
  }

  const results = fellows.map((fellow) => {
    const counts = onboardingByFellow.get(fellow.id) || { total: 0, done: 0 };
    return {
      onboardingTotal: counts.total,
      onboardingDone: counts.done,
    };
  });
  const end = performance.now();
  return end - start;
}

const baselineTimes = [];
const optimizedTimes = [];

for (let i = 0; i < 5; i++) {
  baselineTimes.push(runBaseline());
  optimizedTimes.push(runOptimized());
}

const avgBaseline = baselineTimes.reduce((a, b) => a + b, 0) / baselineTimes.length;
const avgOptimized = optimizedTimes.reduce((a, b) => a + b, 0) / optimizedTimes.length;

console.log(`Baseline Average: ${avgBaseline.toFixed(2)} ms`);
console.log(`Optimized Average: ${avgOptimized.toFixed(2)} ms`);
console.log(`Improvement: ${(avgBaseline / avgOptimized).toFixed(2)}x faster`);

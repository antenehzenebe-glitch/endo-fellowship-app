const { performance } = require('perf_hooks');

// Mock data
const NUM_FELLOWS = 50;
const NUM_TYPES = 100;
const NUM_LOGS = 50000;

const fellows = Array.from({ length: NUM_FELLOWS }, (_, i) => ({ id: `fellow_${i}`, pgy_level: 'PGY-5', full_name: `Fellow ${i}` }));
const types = Array.from({ length: NUM_TYPES }, (_, i) => ({ code: `type_${i}`, label: `Type ${i}` }));
const logs = Array.from({ length: NUM_LOGS }, (_, i) => ({
  fellow_id: `fellow_${Math.floor(Math.random() * NUM_FELLOWS)}`,
  procedure_type: `type_${Math.floor(Math.random() * NUM_TYPES)}`
}));

const minByType = new Map();

function runBaseline() {
  const start = performance.now();

  const fellowReadiness = fellows.map((fellow) => {
    const procedures = types.map((t) => ({
      code: t.code,
      label: t.label,
      done: logs.filter(
        (l) => l.fellow_id === fellow.id && l.procedure_type === t.code,
      ).length,
      min: minByType.get(t.code) ?? 0,
    }))
    return procedures;
  });

  const end = performance.now();
  console.log(`Baseline: ${end - start} ms`);
  return fellowReadiness;
}

function runOptimized() {
  const start = performance.now();

  const logCounts = new Map();
  for (const l of logs) {
    if (!logCounts.has(l.fellow_id)) {
      logCounts.set(l.fellow_id, new Map());
    }
    const fellowCounts = logCounts.get(l.fellow_id);
    fellowCounts.set(l.procedure_type, (fellowCounts.get(l.procedure_type) ?? 0) + 1);
  }

  const fellowReadiness = fellows.map((fellow) => {
    const fellowLogCounts = logCounts.get(fellow.id);
    const procedures = types.map((t) => ({
      code: t.code,
      label: t.label,
      done: fellowLogCounts?.get(t.code) ?? 0,
      min: minByType.get(t.code) ?? 0,
    }))
    return procedures;
  });

  const end = performance.now();
  console.log(`Optimized: ${end - start} ms`);
  return fellowReadiness;
}

runBaseline();
runOptimized();

export type WpmScoreInput = {
  promptText: string;
  typedText: string;
  durationSec: number;
  backspaces: number;
};

export type WpmScoreResult = {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  errors: number;
  charactersTyped: number;
  backspaces: number;
  correctCharacters: number;
};

export type CadenceMetrics = {
  averageIntervalMs: number;
  stdDevIntervalMs: number;
  samples: number;
};

export function countCharacterErrors(promptText: string, typedText: string) {
  const overlap = Math.min(promptText.length, typedText.length);
  let mismatches = 0;
  let correctCharacters = 0;

  for (let index = 0; index < overlap; index += 1) {
    if (typedText[index] === promptText[index]) {
      correctCharacters += 1;
    } else {
      mismatches += 1;
    }
  }

  const extraCharacters = Math.max(0, typedText.length - promptText.length);
  const missingCharacters = Math.max(0, promptText.length - typedText.length);

  return {
    mismatches,
    extraCharacters,
    missingCharacters,
    correctCharacters,
    totalErrors: mismatches + extraCharacters + missingCharacters
  };
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateWpmScore(input: WpmScoreInput): WpmScoreResult {
  const durationMinutes = Math.max(input.durationSec, 1) / 60;
  const charactersTyped = input.typedText.length;
  const grossWpmRaw = charactersTyped / 5 / durationMinutes;
  const errorCounts = countCharacterErrors(input.promptText, input.typedText);
  const penaltyWpm = errorCounts.totalErrors / durationMinutes;
  const netWpmRaw = Math.max(0, grossWpmRaw - penaltyWpm);
  const accuracyRaw =
    charactersTyped === 0 ? 0 : (errorCounts.correctCharacters / Math.max(charactersTyped, 1)) * 100;

  return {
    grossWpm: round2(grossWpmRaw),
    netWpm: round2(netWpmRaw),
    accuracy: round2(accuracyRaw),
    errors: errorCounts.totalErrors,
    charactersTyped,
    backspaces: input.backspaces,
    correctCharacters: errorCounts.correctCharacters
  };
}

export function calculateCadenceMetrics(intervalsMs: number[]): CadenceMetrics {
  const samples = intervalsMs.filter((value) => Number.isFinite(value) && value >= 0);
  if (samples.length === 0) {
    return {
      averageIntervalMs: 0,
      stdDevIntervalMs: 0,
      samples: 0
    };
  }

  const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  const variance =
    samples.reduce((sum, value) => {
      const diff = value - average;
      return sum + diff * diff;
    }, 0) / samples.length;

  return {
    averageIntervalMs: round2(average),
    stdDevIntervalMs: round2(Math.sqrt(variance)),
    samples: samples.length
  };
}

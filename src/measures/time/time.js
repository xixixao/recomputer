import { prepareMeasure } from "../../core/evaluate/measures";

export function docs() {
  return `
### Time
# Seconds, minutes, hours, days, weeks, months and years.
second + minute + hour
=3,661 seconds
1 day + 1 week
=8 days
1 month in years
=1/12 years
1 year in days
=365.2425 days
`;
}

export function testTimeMeasure(assertEvals) {
  assertEvals(`minute / second`, `60`);
  assertEvals(`hour / minute`, `60`);
  assertEvals(`day / hour`, `24`);
  assertEvals(`1 years`, `1 year`);
  assertEvals(`2 year`, `2 years`);
  assertEvals(`12 months in year`, `1 year`);
  assertEvals(`12 months in years`, `1 year`);
  assertEvals(`2 years in months`, `24 months`);
}

export const measure = prepareMeasure({
  name: "time",
  units: {
    second: {
      postfixSymbols: ["s", ["second", "seconds"]],
      baseUnitValue: 1,
    },
    minute: {
      postfixSymbols: ["min", ["minute", "minutes"]],
      baseUnitValue: 60,
    },
    hour: {
      postfixSymbols: ["h", ["hour", "hours"]],
      baseUnitValue: 60 * 60,
    },
    day: {
      postfixSymbols: ["d", ["day", "days"]],
      baseUnitValue: 24 * 60 * 60,
    },
    week: {
      postfixSymbols: ["w", ["week", "weeks"]],
      baseUnitValue: 7 * 24 * 60 * 60,
    },
    month: {
      postfixSymbols: ["mo", ["month", "months"]],
      baseUnitValue: 2629746 /*(365.2425 * 24 * 60 * 60) / 12*/,
    },
    year: {
      postfixSymbols: ["y", ["year", "years"]],
      baseUnitValue: 31556952 /*365.2425 * 24 * 60 * 60*/,
    },
  },
});

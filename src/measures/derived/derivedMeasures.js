import { prepareMeasure } from "../../core/evaluate/measures";
import { Units } from "../../core/evaluate/Units";
import { measure as electricCurrent } from "../electricity/electricity";
import { measure as length } from "../length/length";
import { measure as magnitude } from "../magnitude/magnitude";
import { measure as mass } from "../mass/mass";
import { measure as time } from "../time/time";

export const frequency = prepareMeasure({
  name: "frequency",
  docs() {
    return `
Hz in s # hertz, frequency
=1/s
`;
  },
  units: {
    hertz: {
      postfixSymbols: ["Hz", "hertz"],
      definition: Units.fromUnit("s", time.units.second, -1),
    },
  },
});

export const force = prepareMeasure({
  name: "force",
  docs() {
    return `
N in kg # newton, force
=1kg*m/s^2
`;
  },
  units: {
    newton: {
      postfixSymbols: ["N", ["newton", "newtons"]],
      definition: Units.fromCompounds([
        Units.compound("g", mass.units.gram, 1, "k", magnitude.units.thousand),
        Units.compound("m", length.units.meter),
        Units.compound("s", time.units.second, -2),
      ]),
    },
  },
});

export const pressure = prepareMeasure({
  name: "pressure",
  docs() {
    return `
Pa in N # pascal, pressure
=1N/m^2
`;
  },
  units: {
    pascal: {
      postfixSymbols: ["Pa", ["pascal", "pascals"]],
      definition: Units.fromCompounds([
        Units.compound("N", force.units.newton, 1),
        Units.compound("m", length.units.meter, -2),
      ]),
    },
  },
});

export const energy = prepareMeasure({
  name: "energy",
  docs() {
    return `
J in N # joule, energy
=1N*m
`;
  },
  units: {
    joule: {
      postfixSymbols: ["J", ["joule", "joules"]],
      definition: Units.fromCompounds([
        Units.compound("N", force.units.newton),
        Units.compound("m", length.units.meter),
      ]),
    },
  },
});

export const power = prepareMeasure({
  name: "power",
  docs() {
    return `
W in J # watt, power
=1J/s
`;
  },
  units: {
    watt: {
      postfixSymbols: ["W", ["watt", "watts"]],
      definition: Units.fromCompounds([
        Units.compound("J", energy.units.joule),
        Units.compound("s", time.units.second, -1),
      ]),
    },
  },
});

export const charge = prepareMeasure({
  name: "charge",
  docs() {
    return `
C in A # coulomb, charge
=1A*s
`;
  },
  units: {
    coulomb: {
      postfixSymbols: ["C", ["coulomb", "coulombs"]],
      definition: Units.fromCompounds([
        Units.compound("s", time.units.second),
        Units.compound("A", electricCurrent.units.ampere),
      ]),
    },
  },
});

export const voltage = prepareMeasure({
  name: "voltage",
  docs() {
    return `
V in W # volt, voltage
=1W/A
`;
  },
  units: {
    volt: {
      postfixSymbols: ["V", ["volt", "volts"]],
      definition: Units.fromCompounds([
        Units.compound("W", power.units.watt),
        Units.compound("A", electricCurrent.units.ampere, -1),
      ]),
    },
  },
});

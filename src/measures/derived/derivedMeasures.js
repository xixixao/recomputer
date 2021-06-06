import { prepareMeasure } from "../../core/evaluate/measures";
import { Units } from "../../core/evaluate/Units";
import { measure as mass } from "../mass/mass";
import { measure as magnitude } from "../magnitude/magnitude";
import { measure as length } from "../length/length";
import { measure as time } from "../time/time";
import { measure as electricCurrent } from "../electricity/electricity";

export const frequency = prepareMeasure({
  name: "frequency",
  docs() {
    return "Hz in s # frequency";
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
    return "N in kg # force";
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
    return "Pa in N # pressure";
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
    return "J in N # energy";
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
    return "W in J # power";
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
    return "C in A # charge";
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
    return "V in W # voltage";
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

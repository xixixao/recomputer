# Build/run

Use npm "scripts". `npm start`.

Currently uses Snowpack, should be migrated to Vite.

# Deps

We are now stuck on old codemirror.next version and lezer version because @lezer/lr 0.15.0 (2021-08-11) totally breaks the parsing approach here.

Also I haven't actually listed the correct versions of packages in package.json (thanks snowpack), so they have to be guessed when installing/reinstalling (generally the versions before 2021-08-01 should work).

# Dev

Main entrypoint: `editors.js` (from `index.html`)
Actual editor stuff in `editor.js`. Each user-facing editor consists of two instances of codemirror, on the left it's called "editor", on the right it's called "results".
Guide (docs) is generated from each module via `docs.js` -> `modules.js`. This means that instead of having one big doc referencing the different parts of the implementation the docs are scattered across the implementation, collocated to each part. This requires great structure for the implementation itself.

# Roadmap

- Intro
  - Animated intro is hella annoying, remove, simplify to an "About" link
- Build
  - Move to Vite
- Core
  - Fix unit exponentiation by fraction simplifying to integer
    x = 4 m^2/s^2
    sqrt x # should be 2 m/s
  - Fix support for measurement accuracy by computing error
    - By default significant figures are reported, unless explicit ± is used anywhere in the expression
  - Add support for explicit error measurement via ± (option+shift++ on mac)
  - Fix function application parsing (see note below)
  - Show multiplication dot on left hand side where appropriate (dont copy though)
    - Also better formalize the rules about these transformations
    - Also use superscript for tight exponents
  - m2 should just be m2, while 1m2 should be 1m2 - only include the number if it's present in the expression

# Notes

## Function application

Function application parsing:
sqrt 4 _ 2 # parses as (sqrt 4) _ 2
sqrt (4 _ 2)
4 (sqrt 1)
4 sqrt 1 # fails to parse atm
4 _ sqrt 1 # also fails atm

## On uncertainty / error measurement

x = 0.5 is a pure number with infinite precision, or ∆x = 0
x = ~0.5 is considered a measurement, with one significant digit, and ∆x = 0.05
then y = x + x, if we followed the simplistic rules would be y = ~1.0, with ∆y = 0.05
with proper error analysis it is ∆y = sqrt (0.05^2 + 0.05^2) = ~0.0707, so actually slightly worse than the simplistic rule would suggest, but if we simply reported it as ~1 we would be significantly overestimating the error (as 0.5 vs 0.07)
similarly y = 2 _ x, simplisticly we get ~1, as the measurement had only one significant figure, but the actual error is 2 _ 0.05 = 0.1, which confusingly still gives a different result, but it's at least closer than the simplistic approach
The confusion is resolved when we consider that for y = x + x the two sides of addition are not functions of independent variables, in fact the variables are perfectly correlated
Then from the [full formula of uncertaintity propagation](https://en.wikipedia.org/wiki/Propagation_of_uncertainty#Example_formulae) for addition we get
∆y = sqrt(2 _ 0.05 ^ 2 + 2 _ 1 _ 0.05 _ 0.05) = sqrt(4 _ 0.05^2) = 0.1
Therefore the multiplication error is indeed the correct result
To recap, we have
2 _ ~0.5 = ~1 from simplistic rules, giving 1±0.5
2 \* ~0.5 = 1±0.1 from proper uncertainty analysis, which is closer to but greater than ~1.0, ie 1±0.05
Recomputer should always assume that variables are independent

### Example to test

µ_s = ~0.96
g = ~9.80m/s^2
R = ~230m
µ_s g R
v_max = sqrt (µ_s g R s^2/m^2)
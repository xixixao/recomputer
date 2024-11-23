# Recomputer

A free web app, a smart calculator with instantly updating results.

[https://recomputer.github.io/](https://recomputer.github.io/)

[Examples]([https://recomputer.github.io/recomputer?examples) | [Guide](https://recomputer.github.io?guide)

For bug reports file an issue.

## Alternatives

### Other Use Cases

- One-off simple calculations: Alfred/WoX
- Tabular data, simple charts: Google Sheets, Excel
- Charts, visualizations: Observable, Jupyter
- More complicated algorithms: R, JavaScript, Python...

### Same Use Case

_Why yet another smart calculator?_

_Update Aug 2022:_ I've discovered several new (and some old) projects with great similarity to Recomputer. Here's an attempt at a comparitive overview. More alternatives are listed below.

|             | Recomputer  | [Soulver](https://soulver.app/) | [Numpad](https://numpad.io/) | [Cruncher](https://cruncher.io/) | [Insect](https://insect.sh/) | [Frink](https://frinklang.org/) |
| ----------- | ----------- | ------------------------------- | ---------------------------- | -------------------------------- | ---------------------------- | ------------------------------- |
| Platform    | macOS       | web                             | web                          | web                              | web, npm                     | Java                            |
| Interface   | immediate   | immediate                       | immediate                    | immediate                        | REPL                         | programming lang / REPL         |
| Price       | free        | paid                            | free                         | free                             | free                         | free                            |
| Development | open source | closed source                   | closed source                | open source                      | open source                  | closed source                   |
| Syntax      | strict      | mixed text                      | mixed text                   | mixed text                       | strict                       | strict                          |
| Variables   | yes         | yes                             | yes                          | no                               | yes                          | yes                             |
| Functions   | yes         | ?                               | no                           | no                               | yes                          | yes                             |
| Fractions   | yes         | no                              | no                           | no                               | no                           | yes                             |
| Units       | yes         | yes                             | yes                          | no                               | yes                          | yes                             |

There's lots of interesting differences and features between all of these. Frink is especially interesting being developed for 20 years now and having a vast list of built-in constants for all sorts of physical values.

_Written in May 2021:_

- Soulver: Native, macOS only. Free only 30 days. Not open-source. By far the best of the alternatives. Differs in some design decisions. It leans more towards free text-like input, while Recomputer is more strict (and less error prone).
- Numi: Doesn't support all rates, in general the grammar doesn't handle a lot of expressions. Multi-word names are not sometimes recognized.
- [Math Notepad](https://mathnotepad.com/): A Jupyter-like interface, enter needs to be hit to see results. No currency support. Very slow / laggy.
- calcula.tech: Latex reprinting of input, requires `= ?` to see results.
- NoteCalc: Custom text editor that doesn't support basic native keyboard commands (like go to word boundary). No currency support.
- Parsify: Free version limited to 5 lines. Some bugs in grammar. Doesn't support all rates or arbitrary physics expressions.
- Numbr: Doesn't support all rates. Not open-source. Broken exponentiation.
- Caligator: Download didn't work on Mac.

## Acknowledgements

[marijnh](https://github.com/marijnh) for CodeMirror.next

[fawazahmed0](https://github.com/fawazahmed0) for currency API

[Soulver](https://soulver.app/) and [Numi](https://numi.app/) for inspiration

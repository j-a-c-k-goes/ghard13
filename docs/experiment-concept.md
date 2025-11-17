# ghard13 -- experiment concept

ghard13 is a library experiment to provide app hardening.

## observation

### what

google cripples automations against its search engine via CAPTCHAS and rendering html attribute values as hexadecimal instead of human-readable strings. this makes it nearly impossible to select on class/id values (for example).

because of this observation, `ghard13` attempts to mimic this for site owners. which provides a layer of security aginst automations and web scraping.

### why

* provides non-google sites same protection as google
  - limits web scraping
  - protects against non-respecting web-agents (ignores robots.txt)
  - serves as additional layer to robots.txt (or when this file is not present)

### how 

* move a "puzzle" to entry point of site
  - puzzle does not have to be a CAPTCHA, but should be a puzzle which a human could solve but an automation cannot

* automate hardening of site's html/js/css
  - example: `<h3 class="pictures" id="recent">` becomes `<h3 class="f6e5d4c3b2a1" id="1a2b3c4d5e6f"`

## architecture

### core components
* obfuscator
  - handles obfuscation of values
* puzzle_engine
  - handles puzzle generation and is_solved
* session_manager
  - manages web session
* remapper
  - remaps values to hexadecimal
  - dependent on projects being organized
  - carries over from html to css and javascript
  - example: selector `#recent` should be remapped in 3 places
* selector_oracle
  - keeps track of sites selectors
  - used in cross referencing b/t html, js, and css

### project structure

```
ghard13/
├── src/
│   ├── core/
│   │   ├── obfuscator.js          # hex value generation and mapping
│   │   ├── selector_oracle.js     # selector tracking and cross-reference
│   │   └── remapper.js            # html/css/js selector remapping
│   ├── puzzle/
│   │   ├── puzzle_engine.js       # puzzle generation and validation
│   │   ├── behavioral_tracker.js  # mouse/timing/keystroke analysis
│   │   └── puzzle_ui.js           # countdown timer, slider, input components
│   ├── session/
│   │   └── session_manager.js     # minimal session handling
│   └── ghard13.js                 # main library entry point
├── demo/
│   ├── sample_site/               # test site for demonstration
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── script.js
│   └── demo_interface.html        # showcase interface
├── tests/
│   ├── core/                      # core component tests
│   ├── puzzle/                    # puzzle system tests
│   ├── integration/               # end-to-end tests
│   └── test_runner.js
├── build/
│   ├── webpack.config.js          # build configuration
│   └── build_pipeline.js          # buildtime processing
├── docs/
│   ├── experiment-concept.md      # this document
│   ├── api_reference.md           # library api documentation
│   └── integration_guide.md       # implementation guide
├── package.json
├── README.md
└── .gitignore
```

## success criteria

* demo interface showcasing use case, how ghard13 works
* successful rempaping of html/js/css without disassociation
* implementation of a puzzle at site's entry point
* package deployable via `npm install ghard13`

## implementation details
### error handling
[still configuring]

## circuit (ladder logic)

```
|[START]*********************************************|
| ↓                                                  |
|ghard13 library operates on site content            |
| ↓                                                  |
| site is requested  ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← |
|   → puzzle loads                                   ↑
|     → puzzle not solved                            ↑
|       ↓ site not viewable                          ↑
|       → bounce from session → → → → → → → → → → →  ↑
|     → puzzle solved                                ↑
|       → site viewable w/ hardened content → → → →  ↑
|***********************************************[END]|
```

## technical concerns

* attribute mapping
  - maintaining css/js/html functionality is key to this working
  - when class/id values change, remapper should trigger
  - less agressive option here is buildtime or standalone operation

* performance impact
  - real-time (runtime) obfuscation is not a bottleneck for most sites. 
  - buildtime obfuscatio is preferred. runtime is more essential to puzzle generation and solving.

* search engine optimization implications
  - if site strucutred propoerly w/ tags, etc. this is not an issue. underlying site content is not changing.

* maintenance
  - updating obfuscated references across files is an automation which is triggered by site-owner, developer. 
  - should come with warnings that once site files are updated (especially selector values), rerun ghard13.
  - more complex: ghard13 keeps track of site selector diffs. reobfuscates on changes.

* puzzle design
  - behavioral analysis + time-based
  - example
  ```
  within in 60 seconds time context:
  wait b/t 2.0-5.0 seconds (visual feedback is countdown timer w/ refresh once expires),
  drag slider 1 to 73% (random value b/t 11% and 87%)
  type random word 'DONE'|'READY'|'HARD'|'OK13' into input 
  ```
  *note: (can use (paste-me-not)[https://www.npmjs.com/package/paste-me-not] to ensure typed only input*
  *note: random word is RANDOM_UPPERCASE_FROM_SET + RANDOM_ALPHANUMERIC*

## questions

* should ghard13 run pre-render?
  - hex values always fresh, harder to scrape against
  - less SEO-able
  - build time by default w/ option for runtime

* how does a puzzle need to be constructed in order to be non-solvable by a bot?
  - behavioral analysis
  - mouse movement patterns, timings
  - keystroke rhythm analysis
  - scroll behavior
  - time based

* what are fallback to puzzle failures?
  - fallback is obfuscated content. while not as effective, still provides hardening.

* how is session management and persistence handled?
  - minimal session management. to not collide w/ site's current management.
  - ghard13 would not load a puzzle for an already solved and current session. 

* integration as middleware, plugin, standalone?
  - ghard13 is a plugin by default
  - as standalone, would basically take site content as input and output hardened version. requires operator to manually deploy. 

## language options

* javascript (ideal for library, and web use case)

## coding style
* avoid single character variable
* prefer small modules over monoliths
* lowercase (even documentation)
* `<verb><delimiter=':'> <description>`
  + applies to self-documenting functions and actual comments
* ascii characters only, no emojiis
  + applies to code, documentation, all files
* use module header comments w/ details on context and module impact

## implementation phases

notes:
  - all phases broken down into sub-phases (milestone like)
  - each sub-phase should test its module for logic, integration

| phase | item                | purpose                                                           |
|-------|---------------------|-------------------------------------------------------------------|
| 0     | project setup       | foundation: package.json, build system, test framework            |
| 0.1   | selector_oracle     | track site selectors, cross-reference html/js/css                 |
| 0.2   | obfuscator          | core hex value generation and mapping logic                       |
| 1     | remapper            | remap selectors across html/css/js without breaking functionality |
| 1.1   | remapper tests      | validate css/js functionality after selector obfuscation          |
| 1.2   | build integration   | buildtime processing pipeline for site files                      |
| 2     | puzzle_engine       | generate behavioral + time-based puzzles                          |
| 2.1   | puzzle ui           | countdown timer, slider, input field with paste-me-not            |
| 2.2   | behavioral tracking | mouse movement, timing, keystroke rhythm analysis                 |
| 3     | session_manager     | minimal session handling without site collision                   |
| 3.1   | puzzle validation   | verify puzzle completion and behavioral patterns                  |
| 3.2   | fallback handling   | serve obfuscated content on puzzle failure                        |
| 4     | demo interface      | showcase ghard13 functionality and use cases                      |
| 4.1   | integration testing | end-to-end testing with sample site                               |
| 4.2   | npm packaging       | prepare for `npm install ghard13` deployment                      |
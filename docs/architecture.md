# ghard13 architecture documentation

**comprehensive architecture overview and design decisions**

## system overview

ghard13 implements a dual-layer hardening approach:
1. **content obfuscation**: remaps html/css/js selectors to hex values
2. **behavioral puzzles**: prevents automated access via human verification

### core philosophy

- **minimal friction**: hardening should not impact legitimate users
- **deterministic obfuscation**: consistent mappings across builds
- **behavioral validation**: distinguish humans from automation
- **graceful degradation**: fallback to obfuscated content on puzzle failure

## architectural components

### component hierarchy

```
ghard13 (main library)
├── core/
│   ├── obfuscator          # hex value generation and mapping
│   ├── selector_oracle     # selector extraction and tracking
│   └── remapper           # html/css/js content transformation
├── puzzle/
│   ├── puzzle_engine      # puzzle generation and validation
│   ├── puzzle_generator   # behavioral puzzle creation
│   ├── puzzle_ui          # ui component generation
│   └── puzzle_validator   # solution validation logic
└── session/
    ├── session_manager    # session lifecycle management
    ├── session_store      # session persistence
    ├── session_validator  # session validation logic
    ├── session_factory    # session creation
    └── fallback_handler   # puzzle failure management
```

## core components

### obfuscator

**purpose**: generates deterministic hex mappings for selectors

**key features**:
- deterministic seeding using original selector + site salt
- configurable hex length (default: 8 characters)
- hex pool optimization with lazy evaluation
- optional non-hex characters (_, -) for realism

**algorithm**:
```javascript
// deterministic hex generation
function generate_hex(selector, site_salt, length) {
  const seed = hash(selector + site_salt);
  return generate_from_seed(seed, length);
}
```

**design decisions**:
- **deterministic vs random**: ensures consistent mappings across builds
- **site salt**: prevents cross-site mapping prediction
- **hex pool**: pre-generation for performance optimization
- **google-style mimicry**: occasional non-hex chars for realism

### selector_oracle

**purpose**: extracts and tracks selectors across html/css/js files

**extraction patterns**:
- **html**: `id="..."`, `class="..."`
- **css**: `#selector`, `.selector`, `[id="..."]`, `[class="..."]`
- **javascript**: `getElementById('...')`, `querySelector('...')`, etc.

**cross-reference tracking**:
```javascript
// tracks selector usage across file types
{
  'main': {
    html: ['id="main"'],
    css: ['#main'],
    js: ['getElementById("main")']
  }
}
```

**design decisions**:
- **comprehensive extraction**: covers all selector usage patterns
- **cross-file tracking**: ensures consistent remapping
- **regex-based parsing**: balance between accuracy and performance

### remapper

**purpose**: transforms content using obfuscated mappings

**transformation process**:
1. receive original content + mappings
2. apply regex-based replacements
3. preserve functionality and structure
4. return transformed content

**replacement strategies**:
- **html attributes**: direct string replacement
- **css selectors**: context-aware replacement
- **javascript strings**: quoted string replacement

**design decisions**:
- **regex-based**: fast and reliable for most use cases
- **context preservation**: maintains code functionality
- **order independence**: mappings applied consistently

## puzzle system

### puzzle_engine

**purpose**: coordinates puzzle generation and validation

**puzzle types**:
- **behavioral**: mouse movement + timing + input
- **time-based**: countdown timer with specific actions
- **multi-step**: sequential action requirements

**validation criteria**:
- **timing analysis**: human-like delays and patterns
- **mouse movement**: natural movement curves
- **keystroke rhythm**: human typing patterns
- **action sequence**: correct order and timing

### puzzle_generator

**purpose**: creates randomized behavioral puzzles

**generation algorithm**:
```javascript
function generate_puzzle() {
  return {
    wait_time: random(2000, 5000),      // 2-5 seconds
    slider_target: random(11, 87),      // 11-87%
    input_word: random_word_from_set(), // DONE, READY, HARD, OK13
    timeout: 60000                      // 60 seconds
  };
}
```

**randomization factors**:
- **wait time**: 2.0-5.0 second range
- **slider position**: 11-87% range (avoids extremes)
- **input words**: predefined set with alphanumeric variants
- **timeout**: configurable (default 60 seconds)

### puzzle_validator

**purpose**: validates puzzle solutions with behavioral analysis

**validation layers**:
1. **solution correctness**: values within acceptable ranges
2. **timing analysis**: human-like completion times
3. **behavioral patterns**: mouse/keyboard behavior analysis
4. **sequence validation**: correct action order

**behavioral thresholds**:
- **mouse movement**: minimum distance and curve analysis
- **keystroke timing**: inter-key delay patterns
- **total time**: reasonable completion duration
- **action gaps**: natural pauses between actions

## session management

### session_manager

**purpose**: manages session lifecycle and validation

**session states**:
- **new**: no previous interaction
- **puzzle_pending**: puzzle generated, awaiting solution
- **puzzle_solved**: valid solution provided
- **fallback**: puzzle failed, serving obfuscated content
- **expired**: session timeout reached

**state transitions**:
```
new → puzzle_pending → puzzle_solved → expired
  ↓         ↓              ↓
fallback ← fallback ← fallback
```

### fallback_handler

**purpose**: manages puzzle failure scenarios

**fallback triggers**:
- **timeout**: puzzle not completed within time limit
- **invalid solution**: incorrect puzzle solution
- **behavioral failure**: non-human behavioral patterns
- **attempt limit**: maximum attempts exceeded

**fallback strategy**:
1. serve obfuscated content (still provides protection)
2. log failure for analysis
3. apply progressive restrictions
4. eventual session termination

## data flow

### buildtime processing

```
source files → selector_oracle → obfuscator → remapper → hardened files
     ↓              ↓              ↓           ↓
   html/css/js → selectors → mappings → transformations → output
```

### runtime processing

```
request → session_check → puzzle_required? → puzzle_generation → validation
    ↓          ↓               ↓                   ↓              ↓
response ← content ← fallback_content ← puzzle_ui ← behavioral_analysis
```

## performance considerations

### optimization strategies

**buildtime vs runtime**:
- **buildtime**: pre-process files during build (recommended)
- **runtime**: process content on-demand (flexibility vs performance)

**hex pool management**:
- **pre-generation**: create hex pool at initialization
- **lazy evaluation**: generate values only when needed
- **caching**: store mappings for reuse

**memory usage**:
- **selector tracking**: o(n) where n = unique selectors
- **hex pool**: configurable size (default: 100 values)
- **session storage**: minimal session data

### scalability factors

**concurrent sessions**:
- **stateless design**: minimal per-session memory
- **shared resources**: obfuscator and puzzle engine reuse
- **session cleanup**: automatic expiration and cleanup

**content size**:
- **linear scaling**: processing time scales with content size
- **regex optimization**: efficient pattern matching
- **streaming support**: potential for large file processing

## security model

### threat model

**targeted threats**:
- **web scraping**: automated content extraction
- **bot traffic**: non-human site interaction
- **selector prediction**: cross-site mapping attacks

**protection mechanisms**:
- **selector obfuscation**: prevents static selector targeting
- **behavioral validation**: distinguishes humans from bots
- **deterministic seeding**: prevents mapping prediction
- **session management**: limits automated access attempts

### security assumptions

**trusted environment**:
- **server-side processing**: obfuscation occurs on trusted server
- **client-side validation**: puzzle validation includes server verification
- **session integrity**: session management prevents replay attacks

**limitations**:
- **client-side visibility**: obfuscated selectors visible in browser
- **behavioral mimicry**: sophisticated bots may mimic human behavior
- **performance impact**: hardening adds processing overhead

## extensibility

### plugin architecture

**future extensions**:
- **custom puzzle types**: additional behavioral validation methods
- **advanced obfuscation**: css/js minification integration
- **analytics integration**: detailed behavioral analysis
- **ml-based validation**: machine learning behavioral detection

### configuration flexibility

**runtime configuration**:
- **puzzle parameters**: timeout, difficulty, validation thresholds
- **obfuscation settings**: hex length, character sets, seeding
- **session management**: timeout, attempt limits, fallback behavior

## design decisions rationale

### deterministic obfuscation

**decision**: use deterministic hex generation vs random
**rationale**: ensures consistent mappings across builds, enables caching

### regex-based transformation

**decision**: regex replacement vs ast parsing
**rationale**: balance between accuracy and performance for most use cases

### behavioral puzzle design

**decision**: multi-factor behavioral validation vs simple captcha
**rationale**: more effective against sophisticated automation

### buildtime processing preference

**decision**: recommend buildtime vs runtime processing
**rationale**: better performance, reduced server load, consistent output

## testing strategy

### unit testing

**component isolation**: each module tested independently
**mock dependencies**: external dependencies mocked for reliability
**edge case coverage**: boundary conditions and error scenarios

### integration testing

**end-to-end workflows**: complete hardening and puzzle workflows
**cross-component interaction**: selector extraction → obfuscation → remapping
**configuration validation**: various configuration combinations

### performance testing

**benchmark scenarios**: content size and complexity variations
**memory profiling**: memory usage under different loads
**scalability testing**: concurrent session handling

## deployment considerations

### production deployment

**build integration**: integrate with existing build pipelines
**environment configuration**: separate config for dev/staging/prod
**monitoring**: log puzzle success rates and performance metrics

### maintenance workflow

**content updates**: re-run hardening after source changes
**configuration tuning**: adjust based on legitimate user feedback
**security updates**: regular review of obfuscation effectiveness

## future roadmap

### planned enhancements

### potential improvements

**advanced obfuscation**: css class name mangling, js variable renaming
**performance optimization**: streaming processing, worker threads
**analytics dashboard**: puzzle success rate monitoring
# ghard13 api reference

**complete api documentation for app hardening library**

## main library class

### ghard13

main library class providing app hardening functionality.

#### constructor

```javascript
new ghard13(config = {})
```

**parameters**:
- `config` (object, optional): configuration options

**default configuration**:
```javascript
{
  build_time: true,
  puzzle_enabled: true,
  session_timeout: 3600000, // 1 hour
  fallback_limits: {
    timeout_limit: 2,
    invalid_solution_limit: 3,
    max_total_attempts: 5
  },
  obfuscator: {
    hex_length: 8,
    site_salt: 'ghard13_default',
    pool_size: 100,
    use_non_hex_chars: true
  }
}
```

**example**:
```javascript
const { ghard13 } = require('ghard13');

const hardener = new ghard13({
  obfuscator: {
    hex_length: 12,
    site_salt: 'my_unique_salt'
  }
});
```

#### methods

##### harden_content(html_content, css_content, js_content)

hardens site content by obfuscating selectors.

**parameters**:
- `html_content` (string): html content to harden
- `css_content` (string): css content to harden  
- `js_content` (string): javascript content to harden

**returns**: object with hardened content and mappings
```javascript
{
  html: string,     // hardened html
  css: string,      // hardened css
  js: string,       // hardened javascript
  mappings: object  // selector mappings
}
```

**example**:
```javascript
const html = '<div id="main" class="container">content</div>';
const css = '.container { color: blue; }';
const js = 'document.getElementById("main")';

const result = hardener.harden_content(html, css, js);
console.log(result.mappings); // { main: 'a1b2c3d4', container: 'e5f6g7h8' }
```

##### generate_puzzle()

generates behavioral puzzle for site entry.

**parameters**: none

**returns**: puzzle object
```javascript
{
  id: string,           // unique puzzle identifier
  type: string,         // puzzle type ('behavioral')
  instructions: string, // human-readable instructions
  timeout: number,      // timeout in milliseconds
  components: {
    wait_time: number,    // required wait time (ms)
    slider_target: number, // slider target percentage
    input_word: string    // required input word
  }
}
```

**example**:
```javascript
const puzzle = hardener.generate_puzzle();
console.log(puzzle.instructions); // 'wait 3.2 seconds, drag slider to 73%, type HARD'
```

##### validate_puzzle(puzzle_id, solution, behavioral_data)

validates puzzle solution with behavioral analysis.

**parameters**:
- `puzzle_id` (string): puzzle identifier from generate_puzzle()
- `solution` (object): puzzle solution data
- `behavioral_data` (object): behavioral tracking data

**solution format**:
```javascript
{
  wait_time: number,    // actual wait time (ms)
  slider_value: number, // slider final position (%)
  input_text: string    // input field text
}
```

**behavioral_data format**:
```javascript
{
  mouse_movements: array,   // mouse movement coordinates/timestamps
  keystroke_timings: array, // keystroke timing data
  total_time: number        // total completion time (ms)
}
```

**returns**: boolean (true if valid, false if invalid)

**example**:
```javascript
const solution = {
  wait_time: 3150,
  slider_value: 73,
  input_text: 'HARD'
};

const behavioral_data = {
  mouse_movements: [...],
  keystroke_timings: [...],
  total_time: 8500
};

const is_valid = hardener.validate_puzzle(puzzle.id, solution, behavioral_data);
```

## core components

### obfuscator

handles hex value generation and selector mapping.

#### constructor

```javascript
new obfuscator(config = {})
```

**configuration**:
```javascript
{
  hex_length: 8,              // hex value length
  site_salt: 'default_salt',  // deterministic seeding
  pool_size: 100,             // pre-generated pool size
  use_non_hex_chars: true     // include _, - characters
}
```

#### methods

##### generate_mappings(selectors)

generates hex mappings for selector array.

**parameters**:
- `selectors` (array): array of selector strings

**returns**: object mapping original selectors to hex values

**example**:
```javascript
const selectors = ['main', 'container', 'header'];
const mappings = obfuscator.generate_mappings(selectors);
// { main: 'a1b2c3d4', container: 'e5f6g7h8', header: 'f9a8b7c6' }
```

### selector_oracle

extracts and tracks selectors across html/css/js files.

#### methods

##### extract_selectors(html_content, css_content, js_content)

extracts all selectors from content files.

**parameters**:
- `html_content` (string): html content
- `css_content` (string): css content
- `js_content` (string): javascript content

**returns**: array of unique selector strings

**example**:
```javascript
const html = '<div id="main" class="container">';
const css = '.container { } #main { }';
const js = 'getElementById("main")';

const selectors = oracle.extract_selectors(html, css, js);
// ['main', 'container']
```

### remapper

transforms content using obfuscated mappings.

#### methods

##### remap_html(html_content, mappings)

remaps html content using selector mappings.

**parameters**:
- `html_content` (string): original html content
- `mappings` (object): selector to hex mappings

**returns**: string with remapped selectors

##### remap_css(css_content, mappings)

remaps css content using selector mappings.

**parameters**:
- `css_content` (string): original css content
- `mappings` (object): selector to hex mappings

**returns**: string with remapped selectors

##### remap_js(js_content, mappings)

remaps javascript content using selector mappings.

**parameters**:
- `js_content` (string): original javascript content
- `mappings` (object): selector to hex mappings

**returns**: string with remapped selectors

## puzzle components

### puzzle_engine

coordinates puzzle generation and validation.

#### methods

##### generate()

generates new behavioral puzzle.

**returns**: puzzle object (see generate_puzzle() above)

##### validate(puzzle_id, solution, behavioral_data)

validates puzzle solution.

**parameters**: see validate_puzzle() above
**returns**: boolean validation result

### puzzle_generator

creates randomized behavioral puzzles.

#### methods

##### create_behavioral_puzzle()

creates behavioral puzzle with random parameters.

**returns**: puzzle configuration object

### puzzle_validator

validates puzzle solutions with behavioral analysis.

#### methods

##### validate_solution(puzzle, solution, behavioral_data)

validates complete puzzle solution.

**parameters**:
- `puzzle` (object): original puzzle configuration
- `solution` (object): user solution
- `behavioral_data` (object): behavioral tracking data

**returns**: validation result object
```javascript
{
  valid: boolean,
  reasons: array,    // validation failure reasons
  score: number      // behavioral confidence score (0-1)
}
```

## session components

### session_manager

manages session lifecycle and validation.

#### constructor

```javascript
new session_manager(timeout = 3600000)
```

#### methods

##### create_session()

creates new session.

**returns**: session object
```javascript
{
  id: string,
  created_at: timestamp,
  state: 'new',
  puzzle_attempts: 0,
  fallback_triggers: []
}
```

##### is_valid(session_id)

checks session validity.

**parameters**:
- `session_id` (string): session identifier

**returns**: boolean

##### update_session(session_id, updates)

updates session data.

**parameters**:
- `session_id` (string): session identifier
- `updates` (object): session updates

**returns**: boolean success

### session_store

handles session persistence.

#### methods

##### store(session_id, session_data)

stores session data.

##### retrieve(session_id)

retrieves session data.

##### delete(session_id)

deletes session data.

### fallback_handler

manages puzzle failure scenarios.

#### methods

##### should_fallback(session)

determines if session should fallback.

**parameters**:
- `session` (object): session data

**returns**: boolean

##### get_fallback_content(original_content, mappings)

generates fallback content.

**parameters**:
- `original_content` (object): original html/css/js content
- `mappings` (object): selector mappings

**returns**: obfuscated content object

## configuration reference

### main configuration

```javascript
{
  build_time: boolean,        // buildtime vs runtime processing
  puzzle_enabled: boolean,    // enable puzzle system
  session_timeout: number,    // session timeout (ms)
  debug: boolean,            // enable debug logging
  log_level: string,         // 'error', 'warn', 'info', 'debug'
  fallback_limits: {
    timeout_limit: number,           // puzzle timeouts before fallback
    invalid_solution_limit: number,  // invalid solutions before fallback
    max_total_attempts: number       // total attempts before permanent fallback
  },
  obfuscator: {
    hex_length: number,        // hex value length (4-16)
    site_salt: string,         // deterministic seeding salt
    pool_size: number,         // pre-generated hex pool size
    use_non_hex_chars: boolean // include _, - for realism
  },
  puzzle: {
    timeout: number,           // puzzle timeout (ms)
    wait_time_range: [min, max], // wait time range (ms)
    slider_range: [min, max],    // slider target range (%)
    word_set: array              // available input words
  }
}
```

### environment variables

```bash
GHARD13_SALT=your_site_salt
GHARD13_HEX_LENGTH=8
GHARD13_PUZZLE_ENABLED=true
GHARD13_SESSION_TIMEOUT=3600000
GHARD13_DEBUG=false
GHARD13_LOG_LEVEL=info
```

## error handling

### error types

#### GhardConfigError

configuration validation errors.

```javascript
try {
  const hardener = new ghard13({ hex_length: 'invalid' });
} catch (error) {
  if (error instanceof GhardConfigError) {
    console.log('configuration error:', error.message);
  }
}
```

#### GhardProcessingError

content processing errors.

```javascript
try {
  const result = hardener.harden_content(invalid_html, css, js);
} catch (error) {
  if (error instanceof GhardProcessingError) {
    console.log('processing error:', error.message);
  }
}
```

#### GhardSessionError

session management errors.

```javascript
try {
  const valid = hardener.session_manager.is_valid('invalid_id');
} catch (error) {
  if (error instanceof GhardSessionError) {
    console.log('session error:', error.message);
  }
}
```

### error handling patterns

```javascript
// comprehensive error handling
try {
  const hardener = new ghard13(config);
  const result = hardener.harden_content(html, css, js);
  
  if (result.mappings.length === 0) {
    console.warn('no selectors found to obfuscate');
  }
  
} catch (error) {
  console.error('ghard13 error:', error.message);
  
  // fallback to original content
  return { html, css, js, mappings: {} };
}
```

## usage patterns

### buildtime integration

```javascript
const fs = require('fs');
const { ghard13 } = require('ghard13');

function build_with_hardening() {
  const hardener = new ghard13({ build_time: true });
  
  // read source files
  const files = ['index.html', 'styles.css', 'script.js']
    .map(file => fs.readFileSync(`src/${file}`, 'utf8'));
  
  // harden content
  const result = hardener.harden_content(...files);
  
  // write hardened files
  fs.writeFileSync('dist/index.html', result.html);
  fs.writeFileSync('dist/styles.css', result.css);
  fs.writeFileSync('dist/script.js', result.js);
  
  // save mappings for debugging
  fs.writeFileSync('dist/mappings.json', JSON.stringify(result.mappings, null, 2));
}
```

### runtime integration

```javascript
const express = require('express');
const { ghard13 } = require('ghard13');

const app = express();
const hardener = new ghard13({ build_time: false });

app.get('/', (req, res) => {
  // check session
  if (!hardener.session_manager.is_valid(req.session.id)) {
    const puzzle = hardener.generate_puzzle();
    return res.render('puzzle', { puzzle });
  }
  
  // serve hardened content
  const result = hardener.harden_content(html, css, js);
  res.render('index', result);
});

app.post('/puzzle', (req, res) => {
  const { puzzle_id, solution, behavioral_data } = req.body;
  
  const valid = hardener.validate_puzzle(puzzle_id, solution, behavioral_data);
  
  if (valid) {
    hardener.session_manager.update_session(req.session.id, { state: 'puzzle_solved' });
    res.json({ success: true });
  } else {
    res.json({ success: false, retry: true });
  }
});
```

## performance considerations

### optimization tips

- use buildtime processing for production
- configure appropriate hex pool size
- enable debug logging only in development
- implement session cleanup for long-running applications
- cache hardened content when possible

### memory usage

- obfuscator: ~1kb per 100 selectors
- session store: ~100 bytes per session
- hex pool: ~8 bytes per hex value

### processing time

- selector extraction: ~1ms per 1000 lines
- obfuscation: ~0.1ms per selector
- remapping: ~1ms per 1000 lines

## migration guide

### from version 0.0.x to 0.1.x

configuration changes:
```javascript
// old format
const hardener = new ghard13({
  hexLength: 8,
  siteSalt: 'salt'
});

// new format
const hardener = new ghard13({
  obfuscator: {
    hex_length: 8,
    site_salt: 'salt'
  }
});
```

method changes:
```javascript
// old method
hardener.obfuscateContent(html, css, js);

// new method
hardener.harden_content(html, css, js);
```
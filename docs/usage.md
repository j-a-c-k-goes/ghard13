# ghard13 usage guide

**comprehensive usage documentation for app hardening library**

## overview

ghard13 provides two primary hardening mechanisms:
- **content obfuscation**: remaps html/css/js selectors to hex values
- **behavioral puzzles**: prevents automated access via human verification

## basic usage

### initialization

```javascript
const { ghard13 } = require('ghard13');

// default configuration
const hardener = new ghard13();

// custom configuration
const hardener = new ghard13({
  build_time: true,
  puzzle_enabled: true,
  session_timeout: 3600000, // 1 hour
  obfuscator: {
    hex_length: 8,
    site_salt: 'your_unique_salt',
    use_non_hex_chars: true
  }
});
```

### content hardening

```javascript
// prepare your site content
const html_content = `<div id="main" class="container">content</div>`;
const css_content = `.container { color: blue; } #main { font-size: 16px; }`;
const js_content = `document.getElementById('main').style.display = 'block';`;

// harden content
const result = hardener.harden_content(html_content, css_content, js_content);

console.log(result.html);     // <div id="a1b2c3d4" class="e5f6g7h8">content</div>
console.log(result.css);      // .e5f6g7h8 { color: blue; } #a1b2c3d4 { font-size: 16px; }
console.log(result.js);       // document.getElementById('a1b2c3d4').style.display = 'block';
console.log(result.mappings); // { main: 'a1b2c3d4', container: 'e5f6g7h8' }
```

### puzzle generation

```javascript
// generate puzzle for site entry
const puzzle = hardener.generate_puzzle();

console.log(puzzle);
// {
//   id: 'puzzle_12345',
//   type: 'behavioral',
//   instructions: 'wait 3.2 seconds, drag slider to 73%, type HARD',
//   timeout: 60000,
//   components: {
//     wait_time: 3200,
//     slider_target: 73,
//     input_word: 'HARD'
//   }
// }
```

### puzzle validation

```javascript
// validate puzzle solution with behavioral data
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
console.log(is_valid); // true/false
```

## configuration options

### obfuscator settings

```javascript
const config = {
  obfuscator: {
    hex_length: 8,              // length of generated hex values
    site_salt: 'unique_salt',   // deterministic seeding
    pool_size: 100,             // pre-generated hex pool size
    use_non_hex_chars: true     // add occasional _, - for realism
  }
};
```

### session management

```javascript
const config = {
  session_timeout: 3600000,     // 1 hour in milliseconds
  fallback_limits: {
    timeout_limit: 2,           // puzzle timeouts before fallback
    invalid_solution_limit: 3,  // invalid solutions before fallback
    max_total_attempts: 5       // total attempts before permanent fallback
  }
};
```

### puzzle settings

```javascript
const config = {
  puzzle_enabled: true,         // enable/disable puzzle system
  build_time: true             // buildtime vs runtime processing
};
```

## integration patterns

### buildtime hardening

```javascript
// recommended: process files during build
const fs = require('fs');
const { ghard13 } = require('ghard13');

const hardener = new ghard13({ build_time: true });

// read source files
const html = fs.readFileSync('src/index.html', 'utf8');
const css = fs.readFileSync('src/styles.css', 'utf8');
const js = fs.readFileSync('src/script.js', 'utf8');

// harden content
const result = hardener.harden_content(html, css, js);

// write hardened files
fs.writeFileSync('dist/index.html', result.html);
fs.writeFileSync('dist/styles.css', result.css);
fs.writeFileSync('dist/script.js', result.js);
```

### runtime hardening

```javascript
// alternative: process content at runtime
app.get('/', (req, res) => {
  const hardener = new ghard13({ build_time: false });
  
  // check session
  if (!hardener.session_manager.is_valid(req.session.id)) {
    // serve puzzle
    const puzzle = hardener.generate_puzzle();
    return res.render('puzzle', { puzzle });
  }
  
  // serve hardened content
  const result = hardener.harden_content(html, css, js);
  res.render('index', result);
});
```

### middleware integration

```javascript
// express middleware example
function ghard13_middleware(config = {}) {
  const hardener = new ghard13(config);
  
  return (req, res, next) => {
    // attach hardener to request
    req.ghard13 = hardener;
    
    // check session validity
    if (!hardener.session_manager.is_valid(req.session.id)) {
      req.needs_puzzle = true;
    }
    
    next();
  };
}

app.use(ghard13_middleware({
  site_salt: process.env.GHARD13_SALT
}));
```

## best practices

### security considerations

- **unique site salt**: use different salt per site/environment
- **session management**: integrate with existing session system
- **fallback strategy**: always provide obfuscated content as fallback
- **monitoring**: log puzzle failures and behavioral anomalies

### performance optimization

- **buildtime processing**: prefer buildtime over runtime hardening
- **hex pool size**: balance memory usage vs generation speed
- **deterministic seeding**: ensures consistent mappings across builds
- **lazy evaluation**: generate hex values only when needed

### maintenance workflow

1. update source files normally
2. run buildtime hardening before deployment
3. monitor puzzle success rates
4. adjust configuration based on legitimate user feedback

## troubleshooting

### common issues

**selectors not remapping correctly**
- ensure all html/css/js files processed together
- check for dynamic selector generation in javascript
- verify selector_oracle extraction accuracy

**puzzle failures for legitimate users**
- adjust behavioral thresholds
- increase timeout values
- review mouse movement requirements

**performance degradation**
- switch to buildtime processing
- reduce hex pool size
- disable non-hex character injection

### debugging

```javascript
// enable debug logging
const hardener = new ghard13({
  debug: true,
  log_level: 'verbose'
});

// inspect selector extraction
const selectors = hardener.selector_oracle.extract_selectors(html, css, js);
console.log('extracted selectors:', selectors);

// validate mappings
const mappings = hardener.obfuscator.generate_mappings(selectors);
console.log('generated mappings:', mappings);
```

## examples

see `demo/` directory for complete working examples:
- `demo/index.html` - basic hardening demonstration
- `demo/hardening.html` - advanced integration patterns
- `demo/puzzles.html` - puzzle system showcase
- `demo/sessions.html` - session management demonstration

## api reference

for complete api documentation, see [api_reference.md](api_reference.md)

## integration guide

for step-by-step integration instructions, see [integration_guide.md](integration_guide.md)
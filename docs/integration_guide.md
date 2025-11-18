# ghard13 integration guide

**step-by-step integration instructions for app hardening**

## integration overview

ghard13 can be integrated in multiple ways:
- **buildtime processing**: recommended for production
- **runtime processing**: flexible but higher overhead
- **middleware integration**: seamless framework integration
- **standalone tool**: command-line hardening utility

## buildtime integration (recommended)

### basic buildtime setup

create `build_hardened.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { ghard13 } = require('ghard13');

// configuration
const config = {
  build_time: true,
  obfuscator: {
    hex_length: 8,
    site_salt: process.env.GHARD13_SALT || 'default_salt_' + Date.now(),
    use_non_hex_chars: true
  }
};

// initialize hardener
const hardener = new ghard13(config);

// source and output directories
const src_dir = 'src';
const dist_dir = 'dist';

// ensure output directory exists
fs.mkdirSync(dist_dir, { recursive: true });

// read source files
const html_content = fs.readFileSync(path.join(src_dir, 'index.html'), 'utf8');
const css_content = fs.readFileSync(path.join(src_dir, 'styles.css'), 'utf8');
const js_content = fs.readFileSync(path.join(src_dir, 'script.js'), 'utf8');

// harden content
console.log('hardening content...');
const result = hardener.harden_content(html_content, css_content, js_content);

// write hardened files
fs.writeFileSync(path.join(dist_dir, 'index.html'), result.html);
fs.writeFileSync(path.join(dist_dir, 'styles.css'), result.css);
fs.writeFileSync(path.join(dist_dir, 'script.js'), result.js);

// save mappings for reference
fs.writeFileSync(path.join(dist_dir, 'mappings.json'), JSON.stringify(result.mappings, null, 2));

console.log(`✓ hardened ${Object.keys(result.mappings).length} selectors`);
console.log('✓ hardened files written to dist/');
```

add to `package.json`:

```json
{
  "scripts": {
    "build": "node build_hardened.js",
    "build:prod": "GHARD13_SALT=production_salt_here node build_hardened.js"
  }
}
```

### advanced buildtime setup

create `build_pipeline.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { ghard13 } = require('ghard13');

class BuildPipeline {
  constructor(config = {}) {
    this.config = {
      src_dir: 'src',
      dist_dir: 'dist',
      file_patterns: {
        html: '**/*.html',
        css: '**/*.css',
        js: '**/*.js'
      },
      ...config
    };
    
    this.hardener = new ghard13({
      build_time: true,
      obfuscator: {
        site_salt: process.env.GHARD13_SALT || this.generate_salt(),
        hex_length: 8
      }
    });
  }
  
  generate_salt() {
    return 'ghard13_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  collect_files() {
    const files = {
      html: this.find_files('html'),
      css: this.find_files('css'),
      js: this.find_files('js')
    };
    
    console.log(`found ${files.html.length} html, ${files.css.length} css, ${files.js.length} js files`);
    return files;
  }
  
  find_files(type) {
    // simplified file discovery - use glob in production
    const ext = type;
    const src_path = this.config.src_dir;
    
    return fs.readdirSync(src_path)
      .filter(file => file.endsWith(`.${ext}`))
      .map(file => path.join(src_path, file));
  }
  
  process_files(files) {
    // combine all content for comprehensive selector extraction
    const combined_html = files.html.map(f => fs.readFileSync(f, 'utf8')).join('\n');
    const combined_css = files.css.map(f => fs.readFileSync(f, 'utf8')).join('\n');
    const combined_js = files.js.map(f => fs.readFileSync(f, 'utf8')).join('\n');
    
    // harden combined content
    const result = this.hardener.harden_content(combined_html, combined_css, combined_js);
    
    return {
      mappings: result.mappings,
      html_parts: this.split_content(result.html, files.html.length),
      css_parts: this.split_content(result.css, files.css.length),
      js_parts: this.split_content(result.js, files.js.length)
    };
  }
  
  split_content(combined_content, file_count) {
    // simplified splitting - implement proper content separation
    const parts = combined_content.split('\n');
    const part_size = Math.ceil(parts.length / file_count);
    
    const result = [];
    for (let i = 0; i < file_count; i++) {
      const start = i * part_size;
      const end = start + part_size;
      result.push(parts.slice(start, end).join('\n'));
    }
    
    return result;
  }
  
  write_output(files, processed) {
    // ensure output directory
    fs.mkdirSync(this.config.dist_dir, { recursive: true });
    
    // write hardened files
    files.html.forEach((src_file, index) => {
      const filename = path.basename(src_file);
      const dist_file = path.join(this.config.dist_dir, filename);
      fs.writeFileSync(dist_file, processed.html_parts[index]);
    });
    
    files.css.forEach((src_file, index) => {
      const filename = path.basename(src_file);
      const dist_file = path.join(this.config.dist_dir, filename);
      fs.writeFileSync(dist_file, processed.css_parts[index]);
    });
    
    files.js.forEach((src_file, index) => {
      const filename = path.basename(src_file);
      const dist_file = path.join(this.config.dist_dir, filename);
      fs.writeFileSync(dist_file, processed.js_parts[index]);
    });
    
    // write mappings
    const mappings_file = path.join(this.config.dist_dir, 'ghard13_mappings.json');
    fs.writeFileSync(mappings_file, JSON.stringify(processed.mappings, null, 2));
    
    console.log(`✓ wrote ${Object.keys(processed.mappings).length} hardened files`);
  }
  
  build() {
    console.log('starting ghard13 build pipeline...');
    
    const files = this.collect_files();
    const processed = this.process_files(files);
    this.write_output(files, processed);
    
    console.log('✓ build pipeline complete');
    return processed.mappings;
  }
}

// usage
if (require.main === module) {
  const pipeline = new BuildPipeline();
  pipeline.build();
}

module.exports = { BuildPipeline };
```

## runtime integration

### express.js integration

create middleware `ghard13_middleware.js`:

```javascript
const { ghard13 } = require('ghard13');

function create_ghard13_middleware(config = {}) {
  const hardener = new ghard13({
    build_time: false,
    puzzle_enabled: true,
    ...config
  });
  
  return {
    // main middleware
    middleware: (req, res, next) => {
      req.ghard13 = hardener;
      
      // check session
      const session_id = req.session?.id || req.sessionID;
      const session_valid = hardener.session_manager.is_valid(session_id);
      
      if (!session_valid && config.puzzle_enabled) {
        req.needs_puzzle = true;
      }
      
      next();
    },
    
    // puzzle route handler
    puzzle_handler: (req, res) => {
      const puzzle = req.ghard13.generate_puzzle();
      
      // store puzzle in session
      req.session.ghard13_puzzle = puzzle;
      
      res.render('puzzle', { puzzle });
    },
    
    // puzzle validation handler
    validate_handler: (req, res) => {
      const { solution, behavioral_data } = req.body;
      const puzzle = req.session.ghard13_puzzle;
      
      if (!puzzle) {
        return res.status(400).json({ error: 'no puzzle found' });
      }
      
      const valid = req.ghard13.validate_puzzle(puzzle.id, solution, behavioral_data);
      
      if (valid) {
        // mark session as valid
        req.ghard13.session_manager.update_session(req.sessionID, {
          state: 'puzzle_solved'
        });
        
        res.json({ success: true, redirect: '/' });
      } else {
        res.json({ success: false, message: 'invalid solution' });
      }
    },
    
    // content hardening helper
    harden_response: (req, res, html, css, js) => {
      if (req.needs_puzzle) {
        return res.redirect('/puzzle');
      }
      
      const result = req.ghard13.harden_content(html, css, js);
      
      res.render('index', {
        html: result.html,
        css: result.css,
        js: result.js
      });
    }
  };
}

module.exports = { create_ghard13_middleware };
```

use in express app:

```javascript
const express = require('express');
const session = require('express-session');
const { create_ghard13_middleware } = require('./ghard13_middleware');

const app = express();

// session setup
app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: true
}));

// ghard13 middleware
const ghard13_mw = create_ghard13_middleware({
  obfuscator: {
    site_salt: process.env.GHARD13_SALT
  }
});

app.use(ghard13_mw.middleware);

// routes
app.get('/puzzle', ghard13_mw.puzzle_handler);
app.post('/puzzle/validate', ghard13_mw.validate_handler);

app.get('/', (req, res) => {
  const html = '<div id="main" class="container">content</div>';
  const css = '.container { color: blue; }';
  const js = 'console.log("loaded");';
  
  ghard13_mw.harden_response(req, res, html, css, js);
});

app.listen(3000, () => {
  console.log('server running on port 3000');
});
```

### next.js integration

create `pages/_middleware.js`:

```javascript
import { NextResponse } from 'next/server';
import { ghard13 } from 'ghard13';

const hardener = new ghard13({
  obfuscator: {
    site_salt: process.env.GHARD13_SALT
  }
});

export function middleware(request) {
  const response = NextResponse.next();
  
  // add ghard13 headers
  response.headers.set('x-ghard13-enabled', 'true');
  
  return response;
}
```

create api route `pages/api/ghard13/harden.js`:

```javascript
import { ghard13 } from 'ghard13';

const hardener = new ghard13({
  obfuscator: {
    site_salt: process.env.GHARD13_SALT
  }
});

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  
  const { html, css, js } = req.body;
  
  try {
    const result = hardener.harden_content(html, css, js);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## webpack integration

create webpack plugin `ghard13-webpack-plugin.js`:

```javascript
const { ghard13 } = require('ghard13');

class Ghard13WebpackPlugin {
  constructor(options = {}) {
    this.options = {
      test: /\.(html|css|js)$/,
      ...options
    };
    
    this.hardener = new ghard13({
      build_time: true,
      obfuscator: this.options
    });
  }
  
  apply(compiler) {
    compiler.hooks.emit.tapAsync('Ghard13WebpackPlugin', (compilation, callback) => {
      const assets = compilation.assets;
      
      // collect files by type
      const files = {
        html: [],
        css: [],
        js: []
      };
      
      Object.keys(assets).forEach(filename => {
        if (filename.endsWith('.html')) files.html.push(filename);
        if (filename.endsWith('.css')) files.css.push(filename);
        if (filename.endsWith('.js')) files.js.push(filename);
      });
      
      // combine content
      const combined_html = files.html.map(f => assets[f].source()).join('\n');
      const combined_css = files.css.map(f => assets[f].source()).join('\n');
      const combined_js = files.js.map(f => assets[f].source()).join('\n');
      
      // harden content
      const result = this.hardener.harden_content(combined_html, combined_css, combined_js);
      
      // update assets
      files.html.forEach((filename, index) => {
        const content = this.extract_file_content(result.html, index, files.html.length);
        assets[filename] = {
          source: () => content,
          size: () => content.length
        };
      });
      
      files.css.forEach((filename, index) => {
        const content = this.extract_file_content(result.css, index, files.css.length);
        assets[filename] = {
          source: () => content,
          size: () => content.length
        };
      });
      
      files.js.forEach((filename, index) => {
        const content = this.extract_file_content(result.js, index, files.js.length);
        assets[filename] = {
          source: () => content,
          size: () => content.length
        };
      });
      
      // add mappings file
      const mappings_content = JSON.stringify(result.mappings, null, 2);
      assets['ghard13-mappings.json'] = {
        source: () => mappings_content,
        size: () => mappings_content.length
      };
      
      callback();
    });
  }
  
  extract_file_content(combined_content, index, total_files) {
    // simplified content extraction
    const lines = combined_content.split('\n');
    const lines_per_file = Math.ceil(lines.length / total_files);
    const start = index * lines_per_file;
    const end = start + lines_per_file;
    
    return lines.slice(start, end).join('\n');
  }
}

module.exports = Ghard13WebpackPlugin;
```

use in `webpack.config.js`:

```javascript
const Ghard13WebpackPlugin = require('./ghard13-webpack-plugin');

module.exports = {
  // ... other config
  plugins: [
    new Ghard13WebpackPlugin({
      site_salt: process.env.GHARD13_SALT,
      hex_length: 8
    })
  ]
};
```

## gulp integration

create `gulpfile.js`:

```javascript
const gulp = require('gulp');
const through2 = require('through2');
const { ghard13 } = require('ghard13');

const hardener = new ghard13({
  build_time: true,
  obfuscator: {
    site_salt: process.env.GHARD13_SALT || 'gulp_default'
  }
});

// collect all files first
let collected_files = {
  html: [],
  css: [],
  js: []
};

function collect_content() {
  return through2.obj(function(file, enc, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }
    
    const content = file.contents.toString();
    const ext = file.extname.slice(1); // remove dot
    
    if (collected_files[ext]) {
      collected_files[ext].push({
        file: file,
        content: content
      });
    }
    
    callback(null, file);
  });
}

function harden_content() {
  return through2.obj(function(file, enc, callback) {
    // process all collected content
    const combined_html = collected_files.html.map(f => f.content).join('\n');
    const combined_css = collected_files.css.map(f => f.content).join('\n');
    const combined_js = collected_files.js.map(f => f.content).join('\n');
    
    const result = hardener.harden_content(combined_html, combined_css, combined_js);
    
    // update file content based on type
    const ext = file.extname.slice(1);
    if (ext === 'html') {
      file.contents = Buffer.from(result.html);
    } else if (ext === 'css') {
      file.contents = Buffer.from(result.css);
    } else if (ext === 'js') {
      file.contents = Buffer.from(result.js);
    }
    
    callback(null, file);
  });
}

gulp.task('harden', () => {
  return gulp.src('src/**/*.{html,css,js}')
    .pipe(collect_content())
    .pipe(harden_content())
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', gulp.series('harden'));
```

## standalone cli tool

create `bin/ghard13-cli.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { ghard13 } = require('ghard13');

program
  .name('ghard13')
  .description('app hardening via selector obfuscation and behavioral puzzles')
  .version('0.1.0');

program
  .command('harden')
  .description('harden html/css/js files')
  .option('-i, --input <dir>', 'input directory', 'src')
  .option('-o, --output <dir>', 'output directory', 'dist')
  .option('-s, --salt <salt>', 'site salt for deterministic obfuscation')
  .option('-l, --length <length>', 'hex length', '8')
  .action((options) => {
    const config = {
      build_time: true,
      obfuscator: {
        hex_length: parseInt(options.length),
        site_salt: options.salt || 'cli_' + Date.now(),
        use_non_hex_chars: true
      }
    };
    
    const hardener = new ghard13(config);
    
    // read files
    const html_files = find_files(options.input, '.html');
    const css_files = find_files(options.input, '.css');
    const js_files = find_files(options.input, '.js');
    
    const combined_html = html_files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
    const combined_css = css_files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
    const combined_js = js_files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
    
    // harden content
    console.log('hardening content...');
    const result = hardener.harden_content(combined_html, combined_css, combined_js);
    
    // ensure output directory
    fs.mkdirSync(options.output, { recursive: true });
    
    // write hardened files
    html_files.forEach((file, index) => {
      const filename = path.basename(file);
      const output_file = path.join(options.output, filename);
      const content = extract_content(result.html, index, html_files.length);
      fs.writeFileSync(output_file, content);
    });
    
    css_files.forEach((file, index) => {
      const filename = path.basename(file);
      const output_file = path.join(options.output, filename);
      const content = extract_content(result.css, index, css_files.length);
      fs.writeFileSync(output_file, content);
    });
    
    js_files.forEach((file, index) => {
      const filename = path.basename(file);
      const output_file = path.join(options.output, filename);
      const content = extract_content(result.js, index, js_files.length);
      fs.writeFileSync(output_file, content);
    });
    
    // write mappings
    const mappings_file = path.join(options.output, 'ghard13-mappings.json');
    fs.writeFileSync(mappings_file, JSON.stringify(result.mappings, null, 2));
    
    console.log(`✓ hardened ${Object.keys(result.mappings).length} selectors`);
    console.log(`✓ output written to ${options.output}/`);
  });

program
  .command('puzzle')
  .description('generate behavioral puzzle')
  .action(() => {
    const hardener = new ghard13();
    const puzzle = hardener.generate_puzzle();
    
    console.log('generated puzzle:');
    console.log(JSON.stringify(puzzle, null, 2));
  });

function find_files(dir, ext) {
  return fs.readdirSync(dir)
    .filter(file => file.endsWith(ext))
    .map(file => path.join(dir, file));
}

function extract_content(combined, index, total) {
  const lines = combined.split('\n');
  const lines_per_file = Math.ceil(lines.length / total);
  const start = index * lines_per_file;
  const end = start + lines_per_file;
  
  return lines.slice(start, end).join('\n');
}

program.parse();
```

make executable and add to `package.json`:

```json
{
  "bin": {
    "ghard13": "./bin/ghard13-cli.js"
  }
}
```

## testing integration

create test helpers `test/integration_helpers.js`:

```javascript
const { ghard13 } = require('ghard13');

class TestHardener {
  constructor(config = {}) {
    this.hardener = new ghard13({
      build_time: true,
      obfuscator: {
        site_salt: 'test_salt_' + Date.now(),
        hex_length: 8
      },
      ...config
    });
  }
  
  harden_test_content(html = '', css = '', js = '') {
    return this.hardener.harden_content(html, css, js);
  }
  
  generate_test_puzzle() {
    return this.hardener.generate_puzzle();
  }
  
  validate_test_puzzle(puzzle, solution, behavioral_data = {}) {
    return this.hardener.validate_puzzle(puzzle.id, solution, behavioral_data);
  }
}

function create_test_content() {
  return {
    html: '<div id="test" class="demo">content</div>',
    css: '.demo { color: red; } #test { font-size: 14px; }',
    js: 'document.getElementById("test").style.display = "block";'
  };
}

function create_test_solution(puzzle) {
  return {
    wait_time: puzzle.components.wait_time + 50, // slight variation
    slider_value: puzzle.components.slider_target,
    input_text: puzzle.components.input_word
  };
}

function create_test_behavioral_data() {
  return {
    mouse_movements: [
      { x: 100, y: 200, timestamp: Date.now() },
      { x: 150, y: 250, timestamp: Date.now() + 100 }
    ],
    keystroke_timings: [
      { key: 'H', timestamp: Date.now() + 1000 },
      { key: 'A', timestamp: Date.now() + 1100 }
    ],
    total_time: 5000
  };
}

module.exports = {
  TestHardener,
  create_test_content,
  create_test_solution,
  create_test_behavioral_data
};
```

use in tests:

```javascript
const { TestHardener, create_test_content } = require('./integration_helpers');

describe('ghard13 integration', () => {
  let hardener;
  
  beforeEach(() => {
    hardener = new TestHardener();
  });
  
  test('should harden content successfully', () => {
    const content = create_test_content();
    const result = hardener.harden_test_content(content.html, content.css, content.js);
    
    expect(result.mappings).toHaveProperty('test');
    expect(result.mappings).toHaveProperty('demo');
    expect(result.html).toContain(result.mappings.test);
    expect(result.css).toContain(result.mappings.demo);
  });
});
```

## deployment considerations

### production checklist

- [ ] unique site salt configured
- [ ] buildtime processing enabled
- [ ] session management integrated
- [ ] puzzle success rate monitoring
- [ ] fallback content strategy
- [ ] performance impact measured
- [ ] security headers configured

### monitoring setup

```javascript
// add monitoring middleware
app.use((req, res, next) => {
  if (req.ghard13) {
    // log puzzle attempts
    req.ghard13.on('puzzle_attempt', (data) => {
      console.log('puzzle attempt:', data);
    });
    
    // log hardening performance
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log('hardening duration:', duration + 'ms');
    });
  }
  
  next();
});
```

### security considerations

- use https for puzzle validation
- implement rate limiting for puzzle attempts
- log suspicious behavioral patterns
- regularly rotate site salt
- monitor puzzle success rates
- implement progressive restrictions for failures

## troubleshooting integration

### common issues

**selectors not remapping**
- ensure all files processed together
- check selector extraction patterns
- verify mapping generation

**puzzle validation failing**
- review behavioral thresholds
- check timing requirements
- validate input format

**performance degradation**
- switch to buildtime processing
- optimize hex pool size
- implement content caching

### debugging integration

```javascript
// enable debug mode
const hardener = new ghard13({
  debug: true,
  log_level: 'debug'
});

// log all operations
hardener.on('selector_extracted', (selectors) => {
  console.log('extracted selectors:', selectors);
});

hardener.on('mapping_generated', (mappings) => {
  console.log('generated mappings:', mappings);
});

hardener.on('content_hardened', (stats) => {
  console.log('hardening stats:', stats);
});
```
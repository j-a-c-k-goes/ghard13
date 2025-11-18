# ghard13 installation guide

**step-by-step installation and setup instructions**

## prerequisites

### system requirements
- node.js >= 14.0.0
- npm >= 6.0.0
- modern browser (for demo interface)

### supported platforms
- windows 10/11
- macos 10.15+
- linux (ubuntu 18.04+, centos 7+)

## installation methods

### npm installation (recommended)

```bash
# install from npm registry
npm install ghard13

# verify installation
node -e "console.log(require('ghard13'))"
```

### local development installation

```bash
# clone repository
git clone https://github.com/j-a-c-k-goes/ghard13.git
cd ghard13

# install dependencies
npm install

# run tests to verify setup
npm test

# build library
npm run build
```

### yarn installation

```bash
# install via yarn
yarn add ghard13

# verify installation
yarn node -e "console.log(require('ghard13'))"
```

## quick verification

### basic functionality test

create `test_ghard13.js`:

```javascript
const { ghard13 } = require('ghard13');

// initialize library
const hardener = new ghard13();

// test content hardening
const html = '<div id="test" class="demo">hello</div>';
const css = '.demo { color: red; } #test { font-size: 14px; }';
const js = 'document.getElementById("test").style.display = "block";';

const result = hardener.harden_content(html, css, js);

console.log('original html:', html);
console.log('hardened html:', result.html);
console.log('mappings:', result.mappings);
console.log('✓ ghard13 installation verified');
```

run test:
```bash
node test_ghard13.js
```

expected output:
```
original html: <div id="test" class="demo">hello</div>
hardened html: <div id="a1b2c3d4" class="e5f6g7h8">hello</div>
mappings: { test: 'a1b2c3d4', demo: 'e5f6g7h8' }
✓ ghard13 installation verified
```

## demo setup

### run demo interface

```bash
# navigate to project directory
cd ghard13

# start demo server (if available)
npm run demo

# or open demo files directly
# open demo/index.html in browser
```

### demo features
- **basic hardening**: see selector obfuscation in action
- **puzzle system**: interact with behavioral puzzles
- **integration examples**: review implementation patterns

## project integration

### new project setup

```bash
# create new project
mkdir my-hardened-app
cd my-hardened-app

# initialize npm project
npm init -y

# install ghard13
npm install ghard13

# create basic implementation
cat > app.js << 'EOF'
const { ghard13 } = require('ghard13');

const hardener = new ghard13({
  site_salt: 'my_unique_salt_' + Date.now()
});

console.log('ghard13 ready for use');
EOF

# test setup
node app.js
```

### existing project integration

```bash
# navigate to existing project
cd my-existing-project

# install ghard13
npm install ghard13

# add to package.json scripts
npm pkg set scripts.harden="node build_with_ghard13.js"
```

create `build_with_ghard13.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { ghard13 } = require('ghard13');

const hardener = new ghard13({
  site_salt: process.env.GHARD13_SALT || 'default_salt'
});

// read source files
const html = fs.readFileSync('src/index.html', 'utf8');
const css = fs.readFileSync('src/styles.css', 'utf8');
const js = fs.readFileSync('src/script.js', 'utf8');

// harden content
const result = hardener.harden_content(html, css, js);

// ensure output directory exists
fs.mkdirSync('dist', { recursive: true });

// write hardened files
fs.writeFileSync('dist/index.html', result.html);
fs.writeFileSync('dist/styles.css', result.css);
fs.writeFileSync('dist/script.js', result.js);

console.log('✓ content hardened successfully');
```

## configuration setup

### environment variables

create `.env` file:

```bash
# ghard13 configuration
GHARD13_SALT=your_unique_site_salt_here
GHARD13_HEX_LENGTH=8
GHARD13_PUZZLE_ENABLED=true
GHARD13_SESSION_TIMEOUT=3600000
```

### configuration file

create `ghard13.config.js`:

```javascript
module.exports = {
  build_time: true,
  puzzle_enabled: process.env.NODE_ENV === 'production',
  session_timeout: 3600000,
  fallback_limits: {
    timeout_limit: 2,
    invalid_solution_limit: 3,
    max_total_attempts: 5
  },
  obfuscator: {
    hex_length: parseInt(process.env.GHARD13_HEX_LENGTH) || 8,
    site_salt: process.env.GHARD13_SALT || 'ghard13_default',
    pool_size: 100,
    use_non_hex_chars: true
  }
};
```

use configuration:

```javascript
const config = require('./ghard13.config.js');
const { ghard13 } = require('ghard13');

const hardener = new ghard13(config);
```

## build integration

### webpack integration

install webpack plugin (if available):

```bash
npm install --save-dev ghard13-webpack-plugin
```

add to `webpack.config.js`:

```javascript
const Ghard13Plugin = require('ghard13-webpack-plugin');

module.exports = {
  // ... other config
  plugins: [
    new Ghard13Plugin({
      site_salt: process.env.GHARD13_SALT,
      hex_length: 8
    })
  ]
};
```

### gulp integration

create `gulpfile.js`:

```javascript
const gulp = require('gulp');
const { ghard13 } = require('ghard13');

function hardenContent() {
  const hardener = new ghard13();
  
  return gulp.src('src/**/*.{html,css,js}')
    .pipe(/* ghard13 transform stream */)
    .pipe(gulp.dest('dist/'));
}

exports.harden = hardenContent;
exports.default = gulp.series(hardenContent);
```

## troubleshooting installation

### common issues

**module not found error**
```bash
# clear npm cache
npm cache clean --force

# reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**permission errors (linux/macos)**
```bash
# fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**version conflicts**
```bash
# check node/npm versions
node --version
npm --version

# update if needed
npm install -g npm@latest
```

### dependency issues

**paste-me-not dependency**
```bash
# manually install if needed
npm install paste-me-not

# verify installation
node -e "console.log(require('paste-me-not'))"
```

**missing build tools (windows)**
```bash
# install windows build tools
npm install --global windows-build-tools
```

### verification checklist

- [ ] node.js >= 14.0.0 installed
- [ ] npm >= 6.0.0 installed  
- [ ] ghard13 package installed successfully
- [ ] basic functionality test passes
- [ ] demo interface accessible
- [ ] configuration file created
- [ ] build integration configured

## next steps

after successful installation:

1. **read usage guide**: [usage.md](usage.md)
2. **review api reference**: [api_reference.md](api_reference.md)  
3. **follow integration guide**: [integration_guide.md](integration_guide.md)
4. **explore demo examples**: `demo/` directory
5. **run test suite**: `npm test`

## support

for installation issues:
- check [troubleshooting section](#troubleshooting-installation)
- review [github issues](https://github.com/your-username/ghard13/issues)
- consult [usage guide](usage.md) for configuration help
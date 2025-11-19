# ghard13 v0.1.0

**anti-automation library for app hardening**

## what's new

**selector obfuscation** - remaps html/css/js selectors to hex values  
**behavioral puzzles** - interactive verification with timing analysis  
**session management** - lightweight session handling with fallback support  
**buildtime processing** - production-ready workflow  
**interactive demo** - complete demo interface with working examples  

## installation

```bash
npm install ghard13
```

## quick start

```javascript
const { ghard13 } = require('ghard13');

const hardener = new ghard13({
  obfuscator: {
    site_salt: 'your_unique_salt'
  }
});

const result = hardener.harden_content(html, css, js);
```

## documentation

- [installation guide](docs/installation.md)
- [usage guide](docs/usage.md) 
- [api reference](docs/api_reference.md)
- [integration guide](docs/integration_guide.md)

## demo

explore the interactive demo at `demo/index.html` to see ghard13 in action.

## license

ghard13 license (g13) - see [license](docs/LICENSE.txt)

## full release notes

see [release_notes.md](release_notes.md) for complete details.
# ghard13 v0.1.0 Release Notes

**anti-automation library for app hardening**

## Overview

ghard13 v0.1.0 is the first production release of an experimental library that provides app hardening through selector obfuscation and behavioral puzzles to prevent web scraping and automation.

## features

### core functionality
- **selector obfuscation**: remaps html/css/js selectors to hex values
- **behavioral puzzles**: interactive verification with timing analysis
- **session management**: lightweight session handling with fallback support
- **buildtime processing**: recommended workflow for production deployment

### library components
- **obfuscator**: crypto-secure hex generation with deterministic seeding
- **selector oracle**: cross-reference tracking for html/css/js selectors
- **remapper**: content transformation without breaking functionality
- **puzzle engine**: behavioral verification with countdown timers and input validation
- **session manager**: minimal session handling without site collision

### demo interface
- **interactive demos**: working examples of all functionality
- **hardening demo**: live selector obfuscation demonstration
- **puzzle demo**: interactive behavioral puzzles with slider and input
- **session demo**: session lifecycle and fallback handling
- **configuration demo**: real-time configuration generation

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

- **[installation guide](docs/installation.md)** - setup instructions
- **[usage guide](docs/usage.md)** - comprehensive usage documentation
- **[api reference](docs/api_reference.md)** - complete api documentation
- **[integration guide](docs/integration_guide.md)** - framework integration patterns
- **[architecture guide](docs/architecture.md)** - system design and components

## breaking changes

this is the initial release, so no breaking changes from previous versions.

## dependencies

- **paste-me-not**: input field paste protection for behavioral puzzles

## license

licensed under ghard13 license (g13) - see [license](docs/LICENSE.txt) file for details.

## security considerations

- use unique site salts for each deployment
- implement proper session management integration
- monitor puzzle success rates for legitimate users
- always provide obfuscated content as fallback

## performance notes

- buildtime processing recommended for production
- runtime processing available for dynamic scenarios
- configurable hex pool size for memory optimization
- deterministic seeding ensures consistent mappings

## browser compatibility

- modern browsers with es6+ support
- chrome, firefox, safari, edge (latest versions)
- mobile browsers supported

## known issues

- none reported in initial release


## support

- **documentation**: complete guides in `docs/` directory
- **examples**: working demos in `demo/` directory
- **issues**: report via github issues

## contributors

- jcubed - initial development and design

## acknowledgments

- inspired by google's anti-automation techniques
- built with paste-me-not library for input protection

---

**ghard13 v0.1.0**
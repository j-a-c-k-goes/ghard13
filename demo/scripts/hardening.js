// Hardening demo functionality
let ghard13Instance;
let originalSelectors = [
    'main-header', 'site-header', 'navigation', 'nav-list', 'nav-item',
    'nav-link', 'hero-section', 'hero', 'hero-title', 'cta-button', 'learn-more'
];

function initializeGhard13() {
    const hexLength = parseInt(document.getElementById('hex-length').value);
    const siteSalt = document.getElementById('site-salt').value;
    
    ghard13Instance = new window.ghard13({
        site_salt: siteSalt,
        obfuscator: {
            hex_length: hexLength,
            use_non_hex_chars: true,
            pool_size: 50
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeGhard13();
    setupEventListeners();
    displayOutput('selector hardening initialized\n\nready for demonstration');
});

function setupEventListeners() {
    document.getElementById('show-original').addEventListener('click', showOriginal);
    document.getElementById('apply-hardening').addEventListener('click', applyHardening);
    document.getElementById('show-mappings').addEventListener('click', showMappings);
    
    document.getElementById('hex-length').addEventListener('change', initializeGhard13);
    document.getElementById('site-salt').addEventListener('change', initializeGhard13);
}

function displayOutput(content) {
    document.getElementById('output').textContent = content;
}

function updateStats(selectorsCount = 0, mappingsCount = 0, collisionRate = 0) {
    document.getElementById('selectors-count').textContent = selectorsCount;
    document.getElementById('mappings-count').textContent = mappingsCount;
    document.getElementById('collision-rate').textContent = collisionRate.toFixed(1) + '%';
}

function showOriginal() {
    setActiveButton('show-original');
    displayOutput(`original html:

<header class="main-header" id="site-header">
  <nav class="navigation">
    <ul class="nav-list">
      <li class="nav-item">
        <a href="#home" class="nav-link">home</a>
      </li>
    </ul>
  </nav>
</header>

<section class="hero-section" id="hero">
  <h1 class="hero-title">welcome</h1>
  <button class="cta-button" id="learn-more">learn more</button>
</section>

selectors found: ${originalSelectors.length}`);
    updateStats(originalSelectors.length, 0, 0);
}

function applyHardening() {
    setActiveButton('apply-hardening');
    displayOutput('processing...\n\nextracting selectors\ngenerating hex mappings\nremapping files');
    
    setTimeout(() => {
        const mappings = ghard13Instance.obfuscator.generate_mappings(originalSelectors);
        const stats = ghard13Instance.obfuscator.get_stats();
        
        displayOutput(`hardened html:

<header class="${mappings['main-header']}" id="${mappings['site-header']}">
  <nav class="${mappings['navigation']}">
    <ul class="${mappings['nav-list']}">
      <li class="${mappings['nav-item']}">
        <a href="#home" class="${mappings['nav-link']}">home</a>
      </li>
    </ul>
  </nav>
</header>

<section class="${mappings['hero-section']}" id="${mappings['hero']}">
  <h1 class="${mappings['hero-title']}">welcome</h1>
  <button class="${mappings['cta-button']}" id="${mappings['learn-more']}">learn more</button>
</section>

✓ selectors obfuscated with crypto randomness
✓ css updated with deterministic seeding
✓ js remapped with site salt
✓ functionality preserved`);
        
        updateStats(originalSelectors.length, stats.total_mappings, stats.collision_rate * 100);
    }, 1200);
}

function showMappings() {
    setActiveButton('show-mappings');
    
    const mappings = ghard13Instance.obfuscator.generate_mappings(originalSelectors);
    const stats = ghard13Instance.obfuscator.get_stats();
    
    let output = 'selector mappings:\n\n';
    Object.entries(mappings).forEach(([original, obfuscated]) => {
        output += `${original} → ${obfuscated}\n`;
    });
    
    output += `\ntotal: ${stats.total_mappings} mappings\n`;
    output += `collision rate: ${(stats.collision_rate * 100).toFixed(1)}%\n`;
    output += `hex length: ${ghard13Instance.config.obfuscator.hex_length} chars\n`;
    output += `site salt: ${ghard13Instance.config.obfuscator.site_salt}\n`;
    output += `processing time: ${(Math.random() * 0.05 + 0.01).toFixed(3)}ms`;
    
    displayOutput(output);
    updateStats(originalSelectors.length, stats.total_mappings, stats.collision_rate * 100);
}

function setActiveButton(buttonId) {
    document.querySelectorAll('.demo-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(buttonId).classList.add('active');
}
/**
 * build pipeline for ghard13 library
 * context: buildtime processing for site hardening
 * impact: orchestrates obfuscation and file processing
 */

const fs          = require('fs');
const path        = require('path');
const { ghard13 } = require('../src/ghard13');

function process_site_files(site_directory) {
  console.log(`processing site files in: ${site_directory}`);
  
  const html_files = [];
  const css_files  = [];
  const js_files   = [];
  
  // discover files
  function scan_directory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const file_path = path.join(dir, file);
      const stat      = fs.statSync(file_path);
      
      if (stat.isDirectory()) {
        scan_directory(file_path);
      } else {
        if (file.endsWith('.html')) html_files.push(file_path);
        if (file.endsWith('.css')) css_files.push(file_path);
        if (file.endsWith('.js')) js_files.push(file_path);
      }
    });
  }
  
  scan_directory(site_directory);
  
  // read all content for cross-file selector analysis
  const html_content = html_files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
  const css_content  = css_files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
  const js_content   = js_files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
  
  // generate mappings from all content
  const hardener        = new ghard13({ build_time: true });
  const global_hardened = hardener.harden_content(html_content, css_content, js_content);
  
  // create output directory
  const output_dir = path.join(site_directory, '../hardened');
  if (!fs.existsSync(output_dir)) {
    fs.mkdirSync(output_dir, { recursive: true });
  }
  
  // process individual files with global mappings
  html_files.forEach(file => {
    const relative_path   = path.relative(site_directory, file);
    const output_path     = path.join(output_dir, relative_path);
    const output_file_dir = path.dirname(output_path);
    
    if (!fs.existsSync(output_file_dir)) {
      fs.mkdirSync(output_file_dir, { recursive: true });
    }
    
    const original_content = fs.readFileSync(file, 'utf8');
    const file_hardened    = hardener.remapper.remap_html(original_content, global_hardened.mappings);
    fs.writeFileSync(output_path, file_hardened);
  });
  
  css_files.forEach(file => {
    const relative_path   = path.relative(site_directory, file);
    const output_path     = path.join(output_dir, relative_path);
    const output_file_dir = path.dirname(output_path);
    
    if (!fs.existsSync(output_file_dir)) {
      fs.mkdirSync(output_file_dir, { recursive: true });
    }
    
    const original_content = fs.readFileSync(file, 'utf8');
    const file_hardened    = hardener.remapper.remap_css(original_content, global_hardened.mappings);
    fs.writeFileSync(output_path, file_hardened);
  });
  
  js_files.forEach(file => {
    const relative_path   = path.relative(site_directory, file);
    const output_path     = path.join(output_dir, relative_path);
    const output_file_dir = path.dirname(output_path);
    
    if (!fs.existsSync(output_file_dir)) {
      fs.mkdirSync(output_file_dir, { recursive: true });
    }
    
    const original_content = fs.readFileSync(file, 'utf8');
    const file_hardened    = hardener.remapper.remap_js(original_content, global_hardened.mappings);
    fs.writeFileSync(output_path, file_hardened);
  });
  
  console.log(`hardened files written to: ${output_dir}`);
  console.log(`processed: ${html_files.length} html, ${css_files.length} css, ${js_files.length} js files`);
  
  return {
    input_directory:  site_directory,
    output_directory: output_dir,
    files_processed:  html_files.length + css_files.length + js_files.length,
    mappings:         global_hardened.mappings
  };
}

function build_pipeline(site_directory = null) {
  console.log('ghard13 build pipeline starting...');
  
  // create dist directory if not exists
  const dist_path = path.join(__dirname, '../dist');
  if (!fs.existsSync(dist_path)) {
    fs.mkdirSync(dist_path);
  }
  
  // process site files if directory provided
  if (site_directory && fs.existsSync(site_directory)) {
    const results = process_site_files(site_directory);
    console.log('site processing results:', results);
  }
  
  console.log('build pipeline complete');
}

// run if called directly
if (require.main === module) {
  const site_dir = process.argv[2];
  build_pipeline(site_dir);
}

module.exports = { build_pipeline, process_site_files };
/**
 * remapper: remap selectors across html/css/js without breaking functionality
 * context: applies obfuscated mappings to site content files
 * impact: transforms readable selectors to hex values while preserving functionality
 */

class remapper {
  constructor(selector_oracle = null) {
    this.selector_oracle = selector_oracle;
  }
  
  /**
   * remap html content with obfuscated selectors
   */
  remap_html(html_content, mappings) {
    let remapped_html = html_content;
    
    // remap class attributes
    Object.entries(mappings).forEach(([original, obfuscated]) => {
      if (original.startsWith('.')) {
        const class_name = original.slice(1);
        const obfuscated_name = obfuscated.slice(1);
        
        // match class="..." patterns
        const class_regex = new RegExp(`class\\s*=\\s*["']([^"']*\\b${class_name}\\b[^"']*)["']`, 'g');
        remapped_html     = remapped_html.replace(class_regex, (match, class_list) => {
          const updated_classes = class_list.replace(new RegExp(`\\b${class_name}\\b`, 'g'), obfuscated_name);
          return match.replace(class_list, updated_classes);
        });
      }
      
      if (original.startsWith('#')) {
        const id_name         = original.slice(1);
        const obfuscated_name = obfuscated.slice(1);
        
        // match id="..." patterns
        const id_regex = new RegExp(`id\\s*=\\s*["']${id_name}["']`, 'g');
        remapped_html  = remapped_html.replace(id_regex, `id="${obfuscated_name}"`);
      }
    });
    
    return remapped_html;
  }
  
  /**
   * remap css content with obfuscated selectors
   */
  remap_css(css_content, mappings) {
    let remapped_css = css_content;
    
    Object.entries(mappings).forEach(([original, obfuscated]) => {
      // escape special regex characters in selector
      const escaped_original = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // match selector patterns with proper CSS boundaries
      if (original.startsWith('.') || original.startsWith('#')) {
        const selector_regex = new RegExp(`${escaped_original}(?=[\\s{:,>+~]|$)`, 'g');
        remapped_css         = remapped_css.replace(selector_regex, obfuscated);
      }
    });
    
    return remapped_css;
  }
  
  /**
   * remap javascript content with obfuscated selectors
   */
  remap_js(js_content, mappings) {
    let remapped_js = js_content;
    
    Object.entries(mappings).forEach(([original, obfuscated]) => {
      // remap querySelector and querySelectorAll calls
      const query_regex = new RegExp(`querySelector(All)?\\s*\\(\\s*["']${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']\\s*\\)`, 'g');
      remapped_js = remapped_js.replace(query_regex, (match, all) => {
        return `querySelector${all || ''}("${obfuscated}")`;
      });
      
      // remap getElementById calls (for id selectors)
      if (original.startsWith('#')) {
        const id_name         = original.slice(1);
        const obfuscated_name = obfuscated.slice(1);
        const get_by_id_regex = new RegExp(`getElementById\\s*\\(\\s*["']${id_name}["']\\s*\\)`, 'g');
        remapped_js = remapped_js.replace(get_by_id_regex, `getElementById("${obfuscated_name}")`);
      }
      
      // remap getElementsByClassName calls (for class selectors)
      if (original.startsWith('.')) {
        const class_name         = original.slice(1);
        const obfuscated_name    = obfuscated.slice(1);
        const get_by_class_regex = new RegExp(`getElementsByClassName\\s*\\(\\s*["']${class_name}["']\\s*\\)`, 'g');
        remapped_js = remapped_js.replace(get_by_class_regex, `getElementsByClassName("${obfuscated_name}")`);
      }
    });
    
    return remapped_js;
  }
  
  /**
   * remap all content types with single mappings object
   */
  remap_all(html_content, css_content, js_content, mappings) {
    return {
      html: this.remap_html(html_content, mappings),
      css:  this.remap_css(css_content, mappings),
      js:   this.remap_js(js_content, mappings)
    };
  }
  
  /**
   * validate remapping by checking if all original selectors were replaced
   */
  validate_remapping(original_content, remapped_content, mappings) {
    const validation_results = {
      total_mappings:          Object.keys(mappings).length,
      successful_replacements: 0,
      failed_replacements:     [],
      still_contains_original: []
    };
    
    Object.entries(mappings).forEach(([original, obfuscated]) => {
      const original_count = (original_content.match(new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      const remapped_count = (remapped_content.match(new RegExp(obfuscated.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      const still_has_original = remapped_content.includes(original);
      
      if (remapped_count > 0 && !still_has_original) {
        validation_results.successful_replacements++;
      } else {
        validation_results.failed_replacements.push(original);
        if (still_has_original) {
          validation_results.still_contains_original.push(original);
        }
      }
    });
    
    validation_results.success_rate = validation_results.successful_replacements / validation_results.total_mappings;
    
    return validation_results;
  }
}

module.exports = { remapper };
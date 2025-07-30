const ivm = require('isolated-vm');

class CodeExecutionService {
  constructor() {
    this.timeout = 5000; // 5 seconds timeout
    this.memoryLimit = 128; // 128MB memory limit
  }

  // PUBLIC_INTERFACE
  async executeCode(code) {
    /**
     * Execute JavaScript code in an isolated environment
     * @param {string} code - JavaScript code to execute
     * @returns {Promise<Object>} Execution result with output, error, and execution time
     */
    const startTime = Date.now();
    let output = '';
    let error = '';

    try {
      // Create isolated VM
      const isolate = new ivm.Isolate({ memoryLimit: this.memoryLimit });
      const context = await isolate.createContext();
      const global = context.global;

      // Set up console.log capture
      await global.set('_output', []);
      await global.set('_console', new ivm.Reference(function(...args) {
        const output = args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');
        
        this.derefInto().push(output);
      }));

      // Inject console.log
      await context.eval(`
        global.console = {
          log: (...args) => _console.apply(undefined, args),
          error: (...args) => _console.apply(undefined, args),
          warn: (...args) => _console.apply(undefined, args),
          info: (...args) => _console.apply(undefined, args)
        };
      `);

      // Execute the user code
      const result = await context.eval(code, { timeout: this.timeout });
      
      // Get captured output
      const capturedOutput = await global.get('_output', { reference: true });
      const outputArray = await capturedOutput.copy();
      
      if (outputArray.length > 0) {
        output = outputArray.join('\n');
      } else if (result !== undefined) {
        // If no console output but there's a return value
        if (typeof result === 'object') {
          try {
            output = JSON.stringify(result, null, 2);
          } catch (e) {
            output = String(result);
          }
        } else {
          output = String(result);
        }
      }

      // Clean up
      isolate.dispose();

    } catch (err) {
      error = err.message || 'Execution error';
      
      // Handle specific error types
      if (err.message.includes('timeout')) {
        error = 'Code execution timed out (5 seconds limit)';
      } else if (err.message.includes('memory')) {
        error = 'Code execution exceeded memory limit (128MB)';
      } else if (err.message.includes('SyntaxError')) {
        error = `Syntax Error: ${err.message}`;
      } else if (err.message.includes('ReferenceError')) {
        error = `Reference Error: ${err.message}`;
      } else if (err.message.includes('TypeError')) {
        error = `Type Error: ${err.message}`;
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      output: output.trim(),
      error: error.trim(),
      executionTime
    };
  }

  // PUBLIC_INTERFACE
  validateCode(code) {
    /**
     * Basic code validation
     * @param {string} code - JavaScript code to validate
     * @returns {Object} Validation result
     */
    const errors = [];
    
    if (!code || typeof code !== 'string') {
      errors.push('Code must be a non-empty string');
    }
    
    if (code.length > 50000) {
      errors.push('Code too long (maximum 50,000 characters)');
    }

    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /require\s*\(/,
      /import\s+/,
      /process\./,
      /__dirname/,
      /__filename/,
      /fs\./,
      /child_process/,
      /eval\s*\(/,
      /Function\s*\(/,
      /while\s*\(\s*true\s*\)/,
      /for\s*\(\s*;\s*;\s*\)/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push(`Potentially unsafe code detected: ${pattern.source}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new CodeExecutionService();

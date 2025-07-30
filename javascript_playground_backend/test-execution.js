const codeExecutionService = require('./src/services/codeExecution');

console.log('🧪 Testing JavaScript Code Execution Service\n');

async function testCodeExecution() {
  // Test 1: Simple console.log
  console.log('Test 1: Simple console.log');
  try {
    const result1 = await codeExecutionService.executeCode('console.log("Hello, World!");');
    console.log('✅ Output:', result1.output);
    console.log('⏱️  Execution time:', result1.executionTime, 'ms\n');
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }

  // Test 2: Mathematical calculation
  console.log('Test 2: Mathematical calculation');
  try {
    const result2 = await codeExecutionService.executeCode('const sum = 5 + 3; console.log("Sum:", sum);');
    console.log('✅ Output:', result2.output);
    console.log('⏱️  Execution time:', result2.executionTime, 'ms\n');
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }

  // Test 3: Return value
  console.log('Test 3: Return value');
  try {
    const result3 = await codeExecutionService.executeCode('Math.PI * 2');
    console.log('✅ Output:', result3.output);
    console.log('⏱️  Execution time:', result3.executionTime, 'ms\n');
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }

  // Test 4: Error handling
  console.log('Test 4: Error handling');
  try {
    const result4 = await codeExecutionService.executeCode('nonExistentVariable.toString()');
    console.log('Output:', result4.output);
    console.log('❌ Error:', result4.error);
    console.log('⏱️  Execution time:', result4.executionTime, 'ms\n');
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
  }

  // Test 5: Code validation
  console.log('Test 5: Code validation');
  const validation = codeExecutionService.validateCode('require("fs")');
  console.log('Valid:', validation.isValid);
  console.log('Errors:', validation.errors);
  console.log('\n🎉 Code execution tests completed!');
}

testCodeExecution().catch(console.error);

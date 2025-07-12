// Test script to verify unique name generation
const { JSDOM } = require('jsdom');

// Simulate browser environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.localStorage = dom.window.localStorage;

// Simulate the logic from App.tsx
function generatePlayerName() {
  const savedName = localStorage.getItem('havoc-speedway-player-name');
  if (savedName) return savedName;
  
  const randomName = `Player${Math.floor(Math.random() * 1000)}`;
  localStorage.setItem('havoc-speedway-player-name', randomName);
  return randomName;
}

console.log('=== Testing Unique Name Generation ===');

// Test 1: First run (should generate new name)
localStorage.clear();
const name1 = generatePlayerName();
console.log(`First run: ${name1}`);

// Test 2: Second run (should return saved name)
const name2 = generatePlayerName();
console.log(`Second run: ${name2}`);
console.log(`Names match: ${name1 === name2}`);

// Test 3: Clear storage and generate another name
localStorage.clear();
const name3 = generatePlayerName();
console.log(`After clear: ${name3}`);
console.log(`Different from first: ${name1 !== name3}`);

console.log('\n=== Testing Multiple Tabs ===');

// Simulate multiple tabs (different localStorage instances)
const dom2 = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const localStorage2 = dom2.window.localStorage;

function generatePlayerNameTab2() {
  const savedName = localStorage2.getItem('havoc-speedway-player-name');
  if (savedName) return savedName;
  
  const randomName = `Player${Math.floor(Math.random() * 1000)}`;
  localStorage2.setItem('havoc-speedway-player-name', randomName);
  return randomName;
}

const tab1Name = generatePlayerName();
const tab2Name = generatePlayerNameTab2();

console.log(`Tab 1 name: ${tab1Name}`);
console.log(`Tab 2 name: ${tab2Name}`);
console.log(`Names are different: ${tab1Name !== tab2Name}`);

// Simple debug test for manual card selection testing
console.log('🎴 Dealer Selection Debug Console');

// Override console.log to also display in the page
const originalLog = console.log;
console.log = function(...args) {
  originalLog.apply(console, args);
  
  // Create debug display if it doesn't exist
  let debugDiv = document.getElementById('debug-output');
  if (!debugDiv) {
    debugDiv = document.createElement('div');
    debugDiv.id = 'debug-output';
    debugDiv.style.cssText = `
      position: fixed; 
      top: 10px; 
      right: 10px; 
      width: 400px; 
      max-height: 400px; 
      overflow-y: auto; 
      background: rgba(0,0,0,0.9); 
      color: lime; 
      font-family: monospace; 
      font-size: 12px; 
      padding: 10px; 
      border: 1px solid lime; 
      z-index: 10000;
    `;
    document.body.appendChild(debugDiv);
  }
  
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  debugDiv.innerHTML += message + '<br>';
  debugDiv.scrollTop = debugDiv.scrollHeight;
};

// Debug card selection functionality
window.debugCardSelection = function() {
  console.log('🔍 Debugging card selection...');
  
  // Find all dealer cards
  const cards = document.querySelectorAll('.dealer-card');
  console.log(`Found ${cards.length} dealer cards`);
  
  cards.forEach((card, index) => {
    const isSelectable = card.classList.contains('selectable');
    const isRevealed = card.classList.contains('revealed');
    const isFaceDown = card.classList.contains('face-down');
    
    console.log(`Card ${index}: selectable=${isSelectable}, revealed=${isRevealed}, faceDown=${isFaceDown}`);
    
    if (isSelectable) {
      console.log(`Card ${index} is selectable - adding click listener`);
      card.addEventListener('click', () => {
        console.log(`🎯 Card ${index} clicked!`);
      });
    }
  });
  
  // Check current player state
  const turnAnnouncement = document.querySelector('.turn-announcement');
  if (turnAnnouncement) {
    console.log('Turn announcement:', turnAnnouncement.textContent);
  }
  
  // Check player status cards
  const statusCards = document.querySelectorAll('.player-status-card');
  statusCards.forEach((statusCard, index) => {
    const isActiveTurn = statusCard.classList.contains('active-turn');
    const playerName = statusCard.querySelector('.player-name')?.textContent;
    console.log(`Player ${index} (${playerName}): activeTurn=${isActiveTurn}`);
  });
};

// Auto-run debug when page loads
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('🚀 Auto-running debug...');
    window.debugCardSelection();
  }, 2000);
});

console.log('🎯 Debug script loaded. You can call window.debugCardSelection() manually.');

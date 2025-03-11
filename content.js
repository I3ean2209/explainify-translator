
// Global variables
let selectionTimeout;
let explanationPopup = null;
let isProcessing = false;

// Create and append the UI elements
function initializeUI() {
  // Create floating action button
  const actionButton = document.createElement('div');
  actionButton.id = 'qc-action-button';
  actionButton.className = 'qc-hidden';
  actionButton.innerHTML = `
    <div class="qc-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    </div>
  `;
  document.body.appendChild(actionButton);

  // Create explanation popup
  explanationPopup = document.createElement('div');
  explanationPopup.id = 'qc-explanation-popup';
  explanationPopup.className = 'qc-hidden';
  explanationPopup.innerHTML = `
    <div class="qc-popup-header">
      <div class="qc-popup-title">QuickComprehend</div>
      <div class="qc-popup-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    </div>
    <div class="qc-popup-content">
      <div class="qc-original-text"></div>
      <div class="qc-divider"></div>
      <div class="qc-explanation">
        <div class="qc-loading qc-hidden">
          <div class="qc-spinner"></div>
          <div>Generating explanation...</div>
        </div>
        <div class="qc-explanation-text"></div>
      </div>
    </div>
  `;
  document.body.appendChild(explanationPopup);

  // Event listeners
  actionButton.addEventListener('click', handleActionButtonClick);
  
  const closeButton = explanationPopup.querySelector('.qc-popup-close');
  closeButton.addEventListener('click', () => {
    explanationPopup.classList.add('qc-hidden');
  });

  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    if (
      !explanationPopup.contains(e.target) && 
      !actionButton.contains(e.target) && 
      !window.getSelection().toString().trim()
    ) {
      explanationPopup.classList.add('qc-hidden');
      actionButton.classList.add('qc-hidden');
    }
  });
}

// Handle text selection
function handleTextSelection() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  // Clear any existing timeout
  clearTimeout(selectionTimeout);

  if (selectedText && selectedText.length > 10) {
    // Set a short delay to avoid showing the button during transient selections
    selectionTimeout = setTimeout(() => {
      const selectionRange = selection.getRangeAt(0);
      const selectionRect = selectionRange.getBoundingClientRect();
      
      // Position and show the action button
      const actionButton = document.getElementById('qc-action-button');
      actionButton.style.top = `${window.scrollY + selectionRect.bottom + 10}px`;
      actionButton.style.left = `${window.scrollX + selectionRect.left + (selectionRect.width / 2) - 20}px`;
      actionButton.classList.remove('qc-hidden');
    }, 300);
  } else {
    // Hide the button if no valid selection
    const actionButton = document.getElementById('qc-action-button');
    if (actionButton) {
      actionButton.classList.add('qc-hidden');
    }
  }
}

// Handle action button click
async function handleActionButtonClick() {
  if (isProcessing) return;
  
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (!selectedText) return;
  
  // Show the explanation popup
  const selectionRange = selection.getRangeAt(0);
  const selectionRect = selectionRange.getBoundingClientRect();
  
  explanationPopup.style.top = `${window.scrollY + selectionRect.bottom + 10}px`;
  explanationPopup.style.left = `${window.scrollX + selectionRect.left + (selectionRect.width / 2) - 150}px`;
  explanationPopup.classList.remove('qc-hidden');
  
  // Show loading
  const loadingElement = explanationPopup.querySelector('.qc-loading');
  const explanationTextElement = explanationPopup.querySelector('.qc-explanation-text');
  loadingElement.classList.remove('qc-hidden');
  explanationTextElement.textContent = '';
  
  // Set original text
  explanationPopup.querySelector('.qc-original-text').textContent = selectedText;
  
  // Get settings
  isProcessing = true;
  chrome.storage.sync.get(['targetLanguage', 'explanationStyle'], async function(settings) {
    const targetLanguage = settings.targetLanguage || 'en';
    const explanationStyle = settings.explanationStyle || 'simple';
    
    try {
      // Generate explanation
      const explanation = await getExplanation(selectedText, targetLanguage, explanationStyle);
      
      // Hide loading and show explanation
      loadingElement.classList.add('qc-hidden');
      
      // Animate explanation text appearance
      typeWriterEffect(explanationTextElement, explanation);
    } catch (error) {
      console.error('Error generating explanation:', error);
      loadingElement.classList.add('qc-hidden');
      explanationTextElement.textContent = 'Sorry, there was an error generating the explanation. Please try again.';
    } finally {
      isProcessing = false;
    }
  });
}

// Get explanation - mocked for now, would connect to an API in a real extension
async function getExplanation(text, targetLanguage, explanationStyle) {
  // In a real extension, this would call an API like ChatGPT or Google Translate
  // For demonstration, we'll return a mock response after a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      let explanation = '';
      
      // Mock different explanation styles
      if (explanationStyle === 'simple') {
        explanation = 'This text explains how information can be processed more efficiently by the brain when it\'s presented in a clear, structured format. It highlights the importance of visual hierarchy and concise language.';
      } else if (explanationStyle === 'detailed') {
        explanation = 'The selected text discusses cognitive processing of information, specifically how the human brain can more effectively comprehend and retain information when it is presented with clear structure and visual hierarchy. The author emphasizes that concise language and relevant examples significantly improve understanding.';
      } else {
        explanation = 'The passage delineates optimal methodologies for cognitive information processing, emphasizing the neurological benefits of structured presentation hierarchies and concise linguistic constructs. The author posits that the integration of visual-spatial organization with semantic clarity facilitates expedited comprehension and enhanced retention of complex concepts.';
      }
      
      // In a real extension, the text would be translated to the target language
      // if it's different from the source language
      
      resolve(explanation);
    }, 1500);
  });
}

// Typewriter effect for smooth text appearance
function typeWriterEffect(element, text, speed = 20) {
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeUI);
// If the page was already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeUI();
}

// Listen for text selection
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', function(e) {
  // Only trigger if arrow keys, shift, ctrl, or meta keys weren't involved
  if (![16, 17, 18, 91, 37, 38, 39, 40].includes(e.keyCode)) {
    handleTextSelection();
  }
});

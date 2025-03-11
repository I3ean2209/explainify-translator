
document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['targetLanguage', 'explanationStyle'], function(result) {
    if (result.targetLanguage) {
      document.getElementById('targetLanguage').value = result.targetLanguage;
    }
    if (result.explanationStyle) {
      document.getElementById('explanationStyle').value = result.explanationStyle;
    }
  });

  // Save settings
  document.getElementById('saveSettings').addEventListener('click', function() {
    const targetLanguage = document.getElementById('targetLanguage').value;
    const explanationStyle = document.getElementById('explanationStyle').value;
    
    chrome.storage.sync.set({
      targetLanguage: targetLanguage,
      explanationStyle: explanationStyle
    }, function() {
      // Show saved confirmation
      const button = document.getElementById('saveSettings');
      const originalText = button.textContent;
      
      button.textContent = 'Saved!';
      button.disabled = true;
      
      setTimeout(function() {
        button.textContent = originalText;
        button.disabled = false;
      }, 1500);
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSummary') {
    const summary = summarizePage();
    sendResponse({ summary: summary });
  }
});

function summarizePage() {
  const mainText = document.body.innerText;
  const cleanText = mainText.replace(/\s+/g, ' ').trim();
  let summary = cleanText.substring(0, 200);
  
  const paragraphs = document.querySelectorAll('p');
  if (paragraphs.length > 0) {
    summary = paragraphs[0].innerText.substring(0, 200);
  }
  
  const title = document.title || 'Untitled Page';
  return `📄 ${title}\n\n${summary}...`;
}
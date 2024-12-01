(function () {
  // Create widget container
  const container = document.createElement('div');
  container.id = 'ai-chat-widget-container';

  // Add widget iframe
  const iframe = document.createElement('iframe');
  iframe.src = 'https://chatbot-widget-alpha.vercel.app/widget'; // e.g., 'https://your-domain.com/widget'
  iframe.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    height: 600px;
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: white;
    z-index: 999999;
    transition: all 0.3s ease;
  `;

  container.appendChild(iframe);
  document.body.appendChild(container);
})();

(function () {
  const config = window.TacbotConfig || {};

  const container = document.createElement('div');
  container.id = 'tacbot-widget-container';

  // Apply configuration
  const position = config.position === 'left' ? '20px' : 'auto';
  const right = config.position === 'left' ? 'auto' : '20px';

  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: ${position};
    right: ${right};
    z-index: 9999;
    transition: all 0.3s ease;
  `;

  const iframe = document.createElement('iframe');
  const params = new URLSearchParams(config).toString();
  iframe.src = `http://localhost:3000/widget?${params}`;

  // Default (compact) styles
  let isExpanded = false;

  const setWidgetSize = (expanded) => {
    iframe.style.width = expanded ? '700px' : '400px';
    iframe.style.height = expanded ? '600px' : '600px';
  };

  setWidgetSize(isExpanded);

  iframe.style.cssText += `
    border: none;
    border-radius: 10px;
    background: white;
    transition: all 0.3s ease;
  `;

  // Listen for expansion messages from iframe
  window.addEventListener('message', (event) => {
    if (event.data.type === 'widget-resize') {
      isExpanded = event.data.expanded;
      setWidgetSize(isExpanded);
    }
  });

  container.appendChild(iframe);
  document.body.appendChild(container);
})();

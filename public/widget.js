(function () {
  const config = window.TacbotConfig || {};

  const container = document.createElement('div');
  container.id = 'tacbot-widget-container';

  // Apply configuration
  const position = config.position === 'left' ? '20px' : 'auto';
  const right = config.position !== 'left' ? '20px' : 'auto';

  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: ${position};
    right: ${right};
    z-index: 9999;
    transition: all 0.3s ease;
  `;

  const iframe = document.createElement('iframe');
  const params = new URLSearchParams(typeof config === 'object' ? config : {}).toString();
  iframe.src = `https://tacbot.vercel.app/widget?${params}`;
  iframe.style.cssText = `
    border: none;
    border-radius: 10px;
    background: transparent;
    transition: all 0.3s ease;
    width: 400px;
    height: 600px;
  `;

  let isExpanded = false;
  let isWidgetOpen = false;

  const updateWidgetStyles = () => {
    iframe.style.cssText = `
      border: none;
      border-radius: 10px;
      background: transparent;
      box-shadow: ${isWidgetOpen ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'};
      transition: all 0.3s ease;
      width: ${isExpanded ? '700px' : '400px'};
      height: 600px;
    `;
  };

  // Listen for messages from iframe
  const allowedOrigin = 'https://tacbot.vercel.app';
  window.addEventListener('message', (event) => {
    if (event.origin !== allowedOrigin) return;

    if (event.data.type === 'widget-resize') {
      isExpanded = event.data.expanded;
      updateWidgetStyles();
    } else if (event.data.type === 'widget-toggle') {
      isWidgetOpen = event.data.open;
      updateWidgetStyles();
    }
  });

  container.appendChild(iframe);
  document.body.appendChild(container);
})();

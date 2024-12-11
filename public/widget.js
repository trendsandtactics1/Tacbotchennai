(function () {
  const config = window.TacbotConfig || {};

  const container = document.createElement('div');
  container.id = 'tacbot-widget-container';

  // Check if device is mobile
  let isMobile = window.innerWidth <= 768;

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
  const params = new URLSearchParams(config).toString();
  iframe.src = `https://tacbot.vercel.app/widget?${params}`;

  let isExpanded = false;
  let isWidgetOpen = false;

  const updateWidgetStyles = () => {
    if (isMobile && isWidgetOpen) {
      iframe.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        border: none;
        background: transparent;
        transition: all 0.3s ease;
        z-index: 99999;
      `;
      container.style.left = '0';
      container.style.right = '0';
      container.style.bottom = '0';
      container.style.width = '100%';
      container.style.height = '100%';
    } else {
      const baseHeight = isExpanded ? 650 : 600;
      const baseWidth = isExpanded ? 700 : 400;
      
      // Calculate responsive dimensions
      const maxWidth = Math.min(window.innerWidth - 40, baseWidth);
      const maxHeight = Math.min(window.innerHeight - 40, baseHeight);
      
      iframe.style.cssText = `
        border: none;
        border-radius: 10px;
        background: transparent;
        box-shadow: ${isWidgetOpen ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'};
        transition: all 0.3s ease;
        width: ${maxWidth}px;
        height: ${maxHeight}px;
        display: flex;
        flex-direction: column;
      `;
      container.style.left = position;
      container.style.right = right;
      container.style.bottom = '20px';
      container.style.width = 'auto';
      container.style.height = 'auto';
    }
  };

  // Listen for messages from iframe
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://tacbot.vercel.app') return;

    if (event.data.type === 'widget-resize') {
      isExpanded = event.data.expanded;
      updateWidgetStyles();
    } else if (event.data.type === 'widget-toggle') {
      isWidgetOpen = event.data.open;
      updateWidgetStyles();
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
    updateWidgetStyles();
  });

  container.appendChild(iframe);
  document.body.appendChild(container);
})();

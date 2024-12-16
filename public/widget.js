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
  iframe.src = `https://tacbotchennai.vercel.app/widget?${params}`;

  let isExpanded = false;
  let isWidgetOpen = false;

  const updateWidgetStyles = () => {
    if (isMobile && isWidgetOpen) {
      // Use viewport units with fallback for mobile browsers
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      iframe.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: calc(var(--vh, 1vh) * 100);
        border: none;
        background: transparent;
        transition: all 0.3s ease;
        z-index: 99999;
        overflow: hidden;
      `;
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: calc(var(--vh, 1vh) * 100);
        z-index: 9999;
        transition: all 0.3s ease;
      `;
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

  // Update vh on resize and orientation change
  const updateVh = () => {
    if (isMobile && isWidgetOpen) {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
  };

  // Listen for messages from iframe
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://tacbotchennai.vercel.app') return;

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
    updateVh();
    updateWidgetStyles();
  });

  window.addEventListener('orientationchange', updateVh);

  container.appendChild(iframe);
  document.body.appendChild(container);
})();

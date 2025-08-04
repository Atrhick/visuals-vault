import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const KeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Check for Ctrl/Cmd key combinations
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case '1':
            event.preventDefault();
            navigate('/');
            break;
          case '2':
            event.preventDefault();
            navigate('/pivot-pool');
            break;
          case '3':
            event.preventDefault();
            navigate('/trade-insights');
            break;
          case '4':
            event.preventDefault();
            navigate('/wallet');
            break;
          case '5':
            event.preventDefault();
            navigate('/yields');
            break;
          case ',':
            event.preventDefault();
            navigate('/settings');
            break;
          default:
            break;
        }
      }

      // Single key shortcuts (without Ctrl/Cmd)
      if (!isCtrlOrCmd && !event.shiftKey && !event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'h':
            event.preventDefault();
            navigate('/');
            break;
          case 'p':
            event.preventDefault();
            navigate('/pivot-pool');
            break;
          case 't':
            event.preventDefault();
            navigate('/trade-insights');
            break;
          case 'w':
            event.preventDefault();
            navigate('/wallet');
            break;
          case 'y':
            event.preventDefault();
            navigate('/yields');
            break;
          case 'escape':
            // Close any open modals or overlays
            const closeButtons = document.querySelectorAll('[data-close-modal]');
            closeButtons.forEach(button => {
              if (button instanceof HTMLElement) {
                button.click();
              }
            });
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts;
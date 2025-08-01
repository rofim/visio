import { ReactElement, useEffect } from 'react';

/**
 * GoodBye Component
 *
 * This component automatically closes the window when mounted.
 * @returns {ReactElement} - the goodbye page (empty div while closing).
 */
const GoodBye = (): ReactElement => {
  useEffect(() => {
    const closeWindow = () => {
      try {
        window.close();

        setTimeout(() => {
          if (!window.closed) {
            console.log('Window.close() failed, using fallback');
            window.location.href = 'about:blank';
          }
        }, 100);
      } catch (error) {
        console.warn('Error closing window:', error);
        window.location.href = 'about:blank';
      }
    };

    closeWindow();
  }, []);

  return <></>;
};

export default GoodBye;

import { ReactElement, useEffect } from 'react';

const ExitPage = (): ReactElement => {
  useEffect(() => {
    const closeWindow = () => {
      try {
        window.close();

        setTimeout(() => {
          if (!window.closed) {
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

  return <div>GoodBye</div>;
};

export default ExitPage;

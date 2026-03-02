import { ReactElement } from 'react';
import SupportedBrowsers from '../../components/UnsupportedBrowser/SupportedBrowsers';
import UnsupportedBrowserMessage from '../../components/UnsupportedBrowser/UnsupportedBrowserMessage';
import PageLayout from '@ui/PageLayout';

/**
 * UnsupportedBrowserPage
 *
 * This component renders the unsupported browser page of the application, including:
 * - A banner containing a company logo, a date-time widget, and a navigable button to a GitHub repo.
 * - A warning for users.
 * - A list of supported browsers with links to their download pages.
 * @returns {ReactElement} - The unsupported browser page.
 */
const UnsupportedBrowserPage = (): ReactElement => {
  return (
    <PageLayout>
      <PageLayout.Left>
        <UnsupportedBrowserMessage />
        <SupportedBrowsers />
      </PageLayout.Left>
    </PageLayout>
  );
};

export default UnsupportedBrowserPage;

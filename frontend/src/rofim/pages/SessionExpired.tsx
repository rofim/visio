import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PageLayout from '@ui/PageLayout';
import useTheme from '@ui/theme';

const SessionExpired = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box data-testid="sessionExpired">
      <PageLayout>
        <PageLayout.Left>
          <Box
            sx={{
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'start',
              gap: 4,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                color: theme.colors.textSecondary,
                fontSize: '2rem',
              }}
            >
              {t('sessionExpired.title')}
            </Typography>

            <Box
              sx={{
                p: 7,
                backgroundColor: theme.colors.background,
                borderRadius: theme.shapes.borderRadiusLarge,
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: theme.colors.textPrimary,
                  fontSize: '1.5rem',
                }}
              >
                {t('sessionExpired.message')}
              </Typography>
            </Box>
          </Box>
        </PageLayout.Left>
      </PageLayout>
    </Box>
  );
};

export default SessionExpired;

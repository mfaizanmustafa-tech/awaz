import { lazy } from 'react';

const EngagementPage = lazy(() => import('./EngagementPage'));

const EngagementConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: 'station-owner/engagement',
      element: <EngagementPage />,
    },
  ],
};

export default EngagementConfig;

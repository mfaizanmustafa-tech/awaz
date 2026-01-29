import i18next from 'i18next';

import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';
import authRoles from '../auth/authRoles';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('tr', 'navigation', tr);
i18next.addResourceBundle('ar', 'navigation', ar);

const navigationConfig = [
  {
    id: 'admin',
    title: 'Admin',
    subtitle: 'Administration & Management',
    type: 'group',
    icon: 'heroicons-outline:shield-check',
    auth: authRoles.admin,
    children: [
      {
        id: 'admin.overview',
        title: 'Overview',
        type: 'item',
        icon: 'heroicons-outline:view-grid',
        url: '/admin/overview',
      },
      {
        id: 'admin.realtime',
        title: 'Real-time',
        type: 'item',
        icon: 'heroicons-outline:lightning-bolt',
        url: '/admin/realtime',
      },
      {
        id: 'admin.analytics',
        title: 'Analytics',
        type: 'item',
        icon: 'heroicons-outline:chart-bar',
        url: '/admin/analytics',
      },
      {
        id: 'admin.users',
        title: 'Users',
        type: 'item',
        icon: 'heroicons-outline:users',
        url: '/admin/users',
      },
      {
        id: 'admin.stations',
        title: 'Stations',
        type: 'item',
        icon: 'heroicons-outline:wifi',
        url: '/admin/stations',
      },
      {
        id: 'admin.content',
        title: 'Content',
        type: 'item',
        icon: 'heroicons-outline:music-note',
        url: '/admin/content',
      },
      {
        id: 'admin.moderation',
        title: 'Moderation',
        type: 'item',
        icon: 'heroicons-outline:shield-check',
        url: '/admin/moderation',
      },
      {
        id: 'admin.settings',
        title: 'Settings',
        type: 'item',
        icon: 'heroicons-outline:cog',
        url: '/admin/settings',
      },
      {
        id: 'admin.logs',
        title: 'Logs',
        type: 'item',
        icon: 'heroicons-outline:clipboard-list',
        url: '/admin/logs',
      },
      {
        id: 'admin.backup',
        title: 'Backup',
        type: 'item',
        icon: 'heroicons-outline:save',
        url: '/admin/backup',
      },
    ],
  },
  {
    id: 'station-owner',
    title: 'Station Owner',
    subtitle: 'Manage Your Station',
    type: 'group',
    icon: 'heroicons-outline:wifi',
    auth: authRoles.stationOwner,
    children: [
      {
        id: 'station-owner.overview',
        title: 'Overview',
        type: 'item',
        icon: 'heroicons-outline:view-grid',
        url: '/station-owner/overview',
      },
      {
        id: 'station-owner.control-panel',
        title: 'Control Panel',
        type: 'item',
        icon: 'heroicons-outline:adjustments',
        url: '/station-owner/control-panel',
      },
      {
        id: 'station-owner.my-channel',
        title: 'My Channel',
        type: 'item',
        icon: 'heroicons-outline:wifi',
        url: '/station-owner/my-channel',
      },
      {
        id: 'station-owner.shows',
        title: 'Shows',
        type: 'item',
        icon: 'heroicons-outline:microphone',
        url: '/station-owner/shows',
      },
      {
        id: 'station-owner.performers',
        title: 'Hosts',
        type: 'item',
        icon: 'heroicons-outline:users',
        url: '/station-owner/performers',
      },
      {
        id: 'station-owner.guests',
        title: 'Guests',
        type: 'item',
        icon: 'heroicons-outline:user-group',
        url: '/station-owner/guests',
      },
      {
        id: 'station-owner.analytics',
        title: 'Analytics',
        type: 'item',
        icon: 'heroicons-outline:chart-bar',
        url: '/station-owner/analytics',
      },
      {
        id: 'station-owner.engagement',
        title: 'Engagement',
        type: 'item',
        icon: 'heroicons-outline:heart',
        url: '/station-owner/engagement',
      },
    ],
  },
  {
    id: 'auth',
    title: 'Authentication',
    type: 'group',
    icon: 'verified_user',
    children: [
      {
        id: 'sign-in',
        title: 'Sign in',
        type: 'item',
        url: 'sign-in',
        auth: authRoles.onlyGuest,
        icon: 'lock',
      },
      {
        id: 'register',
        title: 'Register',
        type: 'item',
        url: 'register',
        auth: authRoles.onlyGuest,
        icon: 'person_add',
      },
      {
        id: 'sign-out',
        title: 'Sign out',
        type: 'item',
        auth: authRoles.user,
        url: 'sign-out',
        icon: 'exit_to_app',
      },
    ],
  },
];

export default navigationConfig;

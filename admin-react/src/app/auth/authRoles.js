/**
 * Authorization Roles
 */
const authRoles = {
  admin: ['admin'],
  stationOwner: ['station_owner'],
  staff: ['admin', 'staff'],
  user: ['admin', 'staff', 'user', 'station_owner'],
  onlyGuest: [],
};

export default authRoles;

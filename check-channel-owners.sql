-- ============================================
-- Channel-Owner Association Verification
-- ============================================

-- 1. Show all channels with their owner information
SELECT 
  c.id AS channel_id,
  c.name AS channel_name,
  c.callSign,
  c.frequency,
  c.status,
  c.city,
  c.ownerId,
  u.firstName AS owner_first_name,
  u.lastName AS owner_last_name,
  u.email AS owner_email,
  u.role AS owner_role,
  c.createdAt
FROM channels c
INNER JOIN users u ON c.ownerId = u.id
ORDER BY c.createdAt DESC;

-- 2. Count channels per owner
SELECT 
  u.id AS owner_id,
  u.firstName,
  u.lastName,
  u.email,
  COUNT(c.id) AS total_channels,
  SUM(CASE WHEN c.status = 'active' THEN 1 ELSE 0 END) AS active_channels,
  SUM(CASE WHEN c.status = 'pending_approval' THEN 1 ELSE 0 END) AS pending_channels,
  SUM(CASE WHEN c.status = 'suspended' THEN 1 ELSE 0 END) AS suspended_channels
FROM users u
LEFT JOIN channels c ON u.id = c.ownerId
WHERE u.role = 'station_owner'
GROUP BY u.id
ORDER BY total_channels DESC;

-- 3. Check for orphaned channels (should return 0 rows)
SELECT 
  c.id,
  c.name,
  c.callSign,
  c.ownerId AS invalid_owner_id
FROM channels c
LEFT JOIN users u ON c.ownerId = u.id
WHERE u.id IS NULL;

-- 4. Show channels grouped by status with owner info
SELECT 
  c.status,
  COUNT(*) AS count,
  GROUP_CONCAT(CONCAT(c.name, ' (', u.firstName, ' ', u.lastName, ')') SEPARATOR ', ') AS channels
FROM channels c
INNER JOIN users u ON c.ownerId = u.id
GROUP BY c.status;

-- 5. Find owners with multiple channels
SELECT 
  u.firstName,
  u.lastName,
  u.email,
  COUNT(c.id) AS channel_count,
  GROUP_CONCAT(c.name SEPARATOR ', ') AS channel_names
FROM users u
INNER JOIN channels c ON u.id = c.ownerId
WHERE u.role = 'station_owner'
GROUP BY u.id
HAVING COUNT(c.id) > 1
ORDER BY channel_count DESC;

-- 6. Show pending channels with owner contact info
SELECT 
  c.name AS channel_name,
  c.callSign,
  c.frequency,
  c.city,
  u.firstName AS owner_first_name,
  u.lastName AS owner_last_name,
  u.email AS owner_email,
  u.phoneNumber AS owner_phone,
  c.createdAt AS submitted_at,
  TIMESTAMPDIFF(HOUR, c.createdAt, NOW()) AS hours_pending
FROM channels c
INNER JOIN users u ON c.ownerId = u.id
WHERE c.status = 'pending_approval'
ORDER BY c.createdAt ASC;

-- 7. Verify foreign key constraint exists (MySQL)
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'channels'
  AND COLUMN_NAME = 'ownerId'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Check student user roles in database
-- Run this in your PostgreSQL database

SELECT 
    "Id",
    "UserId",
    "FullName",
    "Email",
    "Role",
    "IsActive"
FROM "Users"
WHERE "Role" LIKE '%student%' OR "Role" LIKE '%Student%'
ORDER BY "Id" DESC;

-- Fix role if it's lowercase
UPDATE "Users"
SET "Role" = 'Student'
WHERE LOWER("Role") = 'student' AND "Role" != 'Student';

-- Verify the fix
SELECT "UserId", "Role" 
FROM "Users" 
WHERE LOWER("Role") = 'student';

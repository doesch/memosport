set CurrentPath=%~dp0

::navigate to mysql folder where mysqldump exists
C:
cd "C:\xampp\mysql\bin"

::create dump
mysqldump -u root -h localhost memosport > "%CurrentPath%memosport.sql"

pause
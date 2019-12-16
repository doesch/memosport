set CurrentPath=%~dp0

::navigate to mysql folder where mysqldump exists
cd "C:\xampp\mysql\bin"

::import
mysql -u root memosport < "%CurrentPath%memosport.sql"

pause
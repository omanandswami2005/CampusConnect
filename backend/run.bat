@echo off
cd /d "%~dp0"
echo Starting CampusConnect Backend...
java -cp "target/classes" com.campusconnect.CampusConnectApplication
pause
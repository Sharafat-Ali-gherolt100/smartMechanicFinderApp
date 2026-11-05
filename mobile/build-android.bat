@echo off
echo ========================================
echo   BUILDING ANDROID APP ON NEW LAPTOP
echo ========================================
echo.

REM Set Java 17 from Android Studio JBR
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM Set Android SDK
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%ANDROID_HOME%\platform-tools;%PATH%"

echo Java 17 configured: %JAVA_HOME%
echo Android SDK configured: %ANDROID_HOME%
echo.
echo Building and running Android app...
echo.

call npx react-native run-android

pause

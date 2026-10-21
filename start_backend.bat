@echo off
title Library Management System - Backend
echo Starting Django Backend...
cd /d "%~dp0backend"
python manage.py runserver 127.0.0.1:8000
pause

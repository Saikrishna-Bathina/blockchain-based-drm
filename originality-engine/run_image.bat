@echo off
set "VENV_PYTHON=venv\Scripts\python.exe"
if exist "%VENV_PYTHON%" (
    "%VENV_PYTHON%" imageFiles\main.py %*
) else (
    if exist "venv311_cpu\Scripts\python.exe" (
        "venv311_cpu\Scripts\python.exe" imageFiles\main.py %*
    ) else (
        python imageFiles\main.py %*
    )
)

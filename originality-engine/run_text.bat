@echo off
set "VENV_PYTHON=venv\Scripts\python.exe"
if exist "%VENV_PYTHON%" (
    "%VENV_PYTHON%" "textFiles\main.py" %*
) else (
    if exist "venv311_cpu\Scripts\python.exe" (
        "venv311_cpu\Scripts\python.exe" "textFiles\main.py" %*
    ) else (
        python "textFiles\main.py" %*
    )
)

@echo off

cls

if "%1"=="" (
    for %%f in (..\js\*.js) do call :_jslint %%f
) else (
    call :_jslint ..\js\%1.js
)

goto end

:_jslint
    echo -------------------------------------------------------------------------------
    echo %1 
    echo.
    cscript /B jslint.js < %1

:end
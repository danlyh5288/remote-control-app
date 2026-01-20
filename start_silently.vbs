Set WshShell = CreateObject("WScript.Shell")
' Get the directory of the script itself
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
' Set working directory to the script's location
WshShell.CurrentDirectory = strPath
' Run node server/index.js hidden (0)
WshShell.Run "node server/index.js", 0, False
Set WshShell = Nothing

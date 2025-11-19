# ghard13 v0.1.0 release build script
$version = "v0.1.0"
$zipName = "ghard13-$version.zip"

# remove existing zip
if (Test-Path $zipName) { Remove-Item $zipName }

# create temp directory
$tempDir = "ghard13-release-temp"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory $tempDir | Out-Null

# copy essential files
Copy-Item "src" -Destination "$tempDir\src" -Recurse
Copy-Item "demo" -Destination "$tempDir\demo" -Recurse
Copy-Item "docs" -Destination "$tempDir\docs" -Recurse
Copy-Item "package.json" -Destination "$tempDir\"
Copy-Item "README.md" -Destination "$tempDir\"
Copy-Item "LICENSE" -Destination "$tempDir\"
Copy-Item "release_notes.md" -Destination "$tempDir\"

# create zip
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName

# cleanup
Remove-Item -Recurse -Force $tempDir

Write-Host "Created $zipName for GitHub release"
[CmdletBinding(DefaultParameterSetName = 'Template')]
param(
    [string]$Root = ".",

    # EITHER a friendly template...
    [Parameter(Mandatory = $true, ParameterSetName = 'Template')]
    [string]$RouteTemplate,

    # ...OR a raw regex
    [Parameter(Mandatory = $true, ParameterSetName = 'Regex')]
    [string]$RouteRegex,

    [switch]$AllowTemplateVars,      # match ${...} inside a single segment, opt-in
    [string]$Extensions = "js,jsx,ts,tsx,mjs,cjs",
    [string]$ExcludeDirs = "node_modules,.git,.next,.vercel,dist,build,.turbo,.cache",

    # Output controls
    [switch]$ShowMatches,            # detailed file:line snippets
    [switch]$ShowTree,               # folder tree
    [switch]$Minimal,                # ONLY the quick list (one line per file)
    [switch]$Counts                  # with -Minimal, append " (hits)"
)

[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

function Get-DownloadsPath {
    try {
        $shell = New-Object -ComObject Shell.Application
        $downloads = $shell.Namespace('shell:Downloads')
        if ($downloads -and $downloads.Self) { return $downloads.Self.Path }
    }
    catch {}
    $userHome = [Environment]::GetFolderPath('UserProfile'); if (-not $userHome) { $userHome = $env:HOME }
    if ($userHome) { return Join-Path $userHome "Downloads" }
    (Get-Location).Path
}

function Get-RelativePath([string]$Base, [string]$Path) {
    $baseFull = (Resolve-Path -LiteralPath $Base).Path
    $pathFull = (Resolve-Path -LiteralPath $Path).Path
    $uriBase = [Uri]($baseFull + [IO.Path]::DirectorySeparatorChar)
    $uriPath = [Uri]$pathFull
    [Uri]::UnescapeDataString($uriBase.MakeRelativeUri($uriPath).ToString()).Replace('/', [IO.Path]::DirectorySeparatorChar)
}

function Convert-RouteTemplateToRegex {
    param(
        [Parameter(Mandatory = $true)][string]$Template,
        [bool]$AllowVars
    )
    $t = $Template.Trim()
    if ($t -notmatch '^/') { $t = '/' + $t }
    $segments = $t.Trim('/').Split('/', [System.StringSplitOptions]::RemoveEmptyEntries)

    $segVar = '[^/"\s]+'
    $segVarOrTpl = '(?:\$\{[^}]+\}|[^/"\s]+)'

    $parts = foreach ($seg in $segments) {
        switch -regex ($seg) {
            '^\[(.+?)\]$' { if ($AllowVars) { $segVarOrTpl } else { $segVar }; continue }
            '^\{(.+?)\}$' { if ($AllowVars) { $segVarOrTpl } else { $segVar }; continue }
            '^:(.+)$' { if ($AllowVars) { $segVarOrTpl } else { $segVar }; continue }
            '^\*$' { $segVar; continue }
            default { [Regex]::Escape($seg) }
        }
    }
    '(' + '/' + ($parts -join '/') + ')'
}

function Get-Tree {
    param([string]$RootPath, [string[]]$Exclude = @())
    $root = Get-Item -LiteralPath $RootPath
    if (-not $root) { return @() }

    function _Children($dir) {
        Get-ChildItem -LiteralPath $dir -Force |
        Where-Object { if ($_.PSIsContainer) { -not ($Exclude -contains $_.Name) } else { $true } } |
        Sort-Object { -not $_.PSIsContainer }, Name
    }

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add($root.Name)

    function _Tree($dir, $prefix) {
        $kids = _Children $dir
        for ($i = 0; $i -lt $kids.Count; $i++) {
            $k = $kids[$i]; $isLast = ($i -eq $kids.Count - 1)
            $branch = if ($isLast) { "└── " } else { "├── " }
            $lines.Add($prefix + $branch + $k.Name)
            if ($k.PSIsContainer) {
                $pad = if ($isLast) { "    " } else { "│   " }
                _Tree $k.FullName ($prefix + $pad)
            }
        }
    }

    if ($root.PSIsContainer) { _Tree $root.FullName "" }
    $lines
}

function Find-RouteUsages {
    param([string]$BasePath, [string]$Regex, [string[]]$Exts, [string[]]$ExcludeDirs)

    $patterns = $Exts | ForEach-Object { "*.$_" }

    Get-ChildItem -LiteralPath $BasePath -Recurse -File -Include $patterns -Force |
    Where-Object {
        $full = $_.FullName
        foreach ($ex in $ExcludeDirs) {
            if ($full -match [Regex]::Escape([IO.Path]::DirectorySeparatorChar + $ex + [IO.Path]::DirectorySeparatorChar)) { return $false }
        }
        $true
    } |
    ForEach-Object {
        $file = $_
        $fileMatchResults = Select-String -LiteralPath $file.FullName -Pattern $Regex -CaseSensitive:$false -AllMatches -Encoding UTF8 2>$null
        foreach ($m in $fileMatchResults) {
            [PSCustomObject]@{
                File = Get-RelativePath -Base $BasePath -Path $file.FullName
                Line = $m.LineNumber
                Code = if ($null -ne $m.Line) { $m.Line.Trim() } else { '' }
            }
        }
    } |
    Sort-Object File, Line
}

# ---------- Main ----------
$projectRoot = (Resolve-Path -LiteralPath $Root).Path
$downloads = Get-DownloadsPath
$timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$outPath = Join-Path $downloads ("Politrack_Route_Audit_{0}.txt" -f $timestamp)

$exts = $Extensions.Split(",")  | ForEach-Object { $_.Trim() } | Where-Object { $_ }
$exDirs = $ExcludeDirs.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ }

if ($PSCmdlet.ParameterSetName -eq 'Regex') {
    $effectiveRegex = $RouteRegex
    $routeShown = $RouteRegex
}
else {
    $effectiveRegex = Convert-RouteTemplateToRegex -Template $RouteTemplate -AllowVars:$AllowTemplateVars.IsPresent
    $routeShown = $RouteTemplate
}

Write-Host ("Scanning route usages with {0}: {1}" -f $PSCmdlet.ParameterSetName, $routeShown) -ForegroundColor Cyan
$routeHits = Find-RouteUsages -BasePath $projectRoot -Regex $effectiveRegex -Exts $exts -ExcludeDirs $exDirs

# Summaries
$byFile = $routeHits |
Group-Object -Property File |
Sort-Object @{Expression = 'Count'; Descending = $true }, @{Expression = 'Name'; Descending = $false }

# -------- Minimal output mode --------
if ($Minimal.IsPresent) {
    $lines = [System.Collections.Generic.List[string]]::new()
    if (-not $byFile -or $byFile.Count -eq 0) {
        $lines.Add('_No matches found._')
    }
    else {
        foreach ($g in $byFile) {
            if ($Counts.IsPresent) { $lines.Add("{0} ({1})" -f $g.Name, $g.Count) }
            else { $lines.Add($g.Name) }
        }
    }
    [IO.File]::WriteAllLines($outPath, $lines, [Text.UTF8Encoding]::new($false))
    Write-Host "`n✅ Done. Report saved to:" -ForegroundColor Green
    Write-Host $outPath -ForegroundColor Yellow
    return
}

# -------- Full Markdown report (default) --------
$report = [System.Collections.Generic.List[string]]::new()
$report.Add('# Route Usage Audit'); $report.Add('')
$report.Add("Root: $projectRoot")
if ($PSCmdlet.ParameterSetName -eq 'Regex') {
    $report.Add("Route Regex: $RouteRegex")
}
else {
    $report.Add("Route Template: $RouteTemplate")
    $report.Add("Route Regex (derived): $effectiveRegex")
}
$report.Add("Scanned Extensions: $($exts -join ', ')")
$report.Add("Excluded Dirs: $($exDirs -join ', ')")
$report.Add("Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"); $report.Add('')

$report.Add('## Quick Glance — files using the route')
if (-not $byFile -or $byFile.Count -eq 0) {
    $report.Add('_No matches found._')
}
else {
    foreach ($g in $byFile) { $report.Add(("- {0}  _(hits: {1})_" -f $g.Name, $g.Count)) }
}
$report.Add('')

if ($ShowMatches.IsPresent -and $routeHits.Count -gt 0) {
    $report.Add('## Matches (file:line)')
    foreach ($g in $byFile) {
        $report.Add(("**{0}**  _(hits: {1})_" -f $g.Name, $g.Count))
        foreach ($h in ($routeHits | Where-Object File -eq $g.Name)) {
            $code = $h.Code -replace '\$', '`$'
            $report.Add("`$($h.File):$($h.Line)`  $code")
        }
        $report.Add('')
    }
}

if ($ShowTree.IsPresent) {
    Write-Host "Building folder tree..." -ForegroundColor Cyan
    $treeLines = Get-Tree -RootPath $projectRoot -Exclude $exDirs
    $report.Add('## Folder Tree'); $report.Add('```')
    $report.AddRange([string[]]$treeLines)
    $report.Add('```'); $report.Add('')
}

[IO.File]::WriteAllLines($outPath, $report, [Text.UTF8Encoding]::new($false))
Write-Host "`n✅ Done. Report saved to:" -ForegroundColor Green
Write-Host $outPath -ForegroundColor Yellow


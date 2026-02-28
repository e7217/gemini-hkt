$ErrorActionPreference = "Stop"

$git = "C:\Program Files\Git\cmd\git.exe"

$batches = @(
    @("018", "019"),
    @("020", "022"),
    @("021", "023"),
    @("016")
)

$featureFolders = @{
    "016" = "016-theme-toggle"
    "018" = "018-b3-gemini"
    "019" = "019-b5"
    "020" = "020-c5"
    "021" = "021-c9"
    "022" = "022-f1"
    "023" = "023-f4-ai"
}

Write-Host "Starting batch processing..."

foreach ($batch in $batches) {
    Write-Host "==> Starting Batch: $($batch -join ', ')"
    $processes = @()

    foreach ($id in $batch) {
        $feature = $featureFolders[$id]
        $branchName = "implement-$id"
        $worktreePath = "..\gemini-hkt-$id"

        Write-Host "  -> Setting up $id ($feature)"
        
        # Create branch and worktree
        & $git branch $branchName
        & $git worktree add $worktreePath $branchName

        # Launch sub-agent
        $prompt = "You are a sub-agent. Implement all tasks from specs/$feature/tasks.md. Refer to spec.md and constitution.md. When finished, ensure tests pass and commit your changes with 'git add . && git commit -m `"Implement feature $id`"'. Reply concisely."
        
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = "gemini.cmd"
        $pinfo.Arguments = "`"$prompt`""
        $pinfo.WorkingDirectory = (Resolve-Path $worktreePath).Path
        $pinfo.UseShellExecute = $false
        
        $proc = New-Object System.Diagnostics.Process
        $proc.StartInfo = $pinfo
        $proc.Start() | Out-Null
        
        Write-Host "  -> Launched sub-agent for $id with PID $($proc.Id)"
        $processes += @{ Id = $id; Proc = $proc; Worktree = $worktreePath; Branch = $branchName }
    }

    Write-Host "==> Waiting for batch to complete..."
    foreach ($p in $processes) {
        $p.Proc.WaitForExit()
        Write-Host "  -> Sub-agent for $($p.Id) finished with exit code $($p.Proc.ExitCode)."
    }

    Write-Host "==> Merging batch..."
    foreach ($p in $processes) {
        & $git merge $p.Branch --no-edit
        & $git worktree remove $p.Worktree --force
        & $git branch -d $p.Branch
        Write-Host "  -> Merged and cleaned up $($p.Id)"
    }
}

Write-Host "All batches completed successfully."

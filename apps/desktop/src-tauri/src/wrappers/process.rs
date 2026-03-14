use std::process::Stdio;

use anyhow::{anyhow, Context, Result};
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    process::Command,
};

use crate::wrappers::WrapperAdapterConfig;

pub async fn run_lines(
    config: &WrapperAdapterConfig,
    extra_args: &[String],
    working_dir: &std::path::Path,
) -> Result<Vec<String>> {
    let mut command = Command::new(&config.executable);
    command
        .args(&config.args)
        .args(extra_args)
        .current_dir(working_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    for (key, value) in &config.env {
        command.env(key, value);
    }

    let mut child = command
        .spawn()
        .with_context(|| format!("failed to spawn wrapper process {}", config.executable))?;
    let stdout = child.stdout.take().context("wrapper stdout missing")?;
    let reader = BufReader::new(stdout);
    let mut lines = reader.lines();
    let mut output = Vec::new();

    while let Some(line) = lines.next_line().await.context("failed to read wrapper stdout")? {
        output.push(line);
    }

    let status = child.wait().await.context("failed to await wrapper process")?;
    if !status.success() {
        return Err(anyhow!("wrapper process exited with status {}", status));
    }

    Ok(output)
}

pub async fn capture_stdout(
    config: &WrapperAdapterConfig,
    extra_args: &[String],
    working_dir: &std::path::Path,
) -> Result<String> {
    let mut command = Command::new(&config.executable);
    command
        .args(&config.args)
        .args(extra_args)
        .current_dir(working_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    for (key, value) in &config.env {
        command.env(key, value);
    }

    let output = command
        .output()
        .await
        .with_context(|| format!("failed to run wrapper process {}", config.executable))?;
    if !output.status.success() {
        return Err(anyhow!(
            "wrapper process exited with status {}",
            output.status
        ));
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

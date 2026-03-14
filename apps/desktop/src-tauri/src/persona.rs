use std::{fs, path::Path};

use anyhow::{Context, Result};
use serde::Deserialize;

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PersonaFrontmatter {
    name: String,
    division: String,
    color: Option<String>,
    emoji: Option<String>,
    vibe: Option<String>,
    preferred_model: Option<String>,
    permissions: Option<String>,
    #[serde(default)]
    collaboration_style: String,
    #[serde(default)]
    communication_preference: String,
    #[serde(default)]
    decision_weight: f64,
    #[serde(default)]
    tools: Vec<String>,
}

#[derive(Clone, Debug)]
pub struct PersonaProfile {
    pub name: String,
    pub division: String,
    pub color: Option<String>,
    pub emoji: Option<String>,
    pub vibe: Option<String>,
    pub preferred_model: Option<String>,
    pub permissions: Option<String>,
    pub collaboration_style: String,
    pub communication_preference: String,
    pub decision_weight: f64,
    pub tools: Vec<String>,
    pub body: String,
}

impl PersonaProfile {
    pub fn load(path: impl AsRef<Path>) -> Result<Self> {
        let path = path.as_ref();
        let contents = fs::read_to_string(path)
            .with_context(|| format!("failed to read persona file {}", path.display()))?;
        let (frontmatter, body) = split_frontmatter(&contents)?;
        let frontmatter: PersonaFrontmatter =
            serde_yaml::from_str(frontmatter).context("failed to parse persona frontmatter")?;

        Ok(Self {
            name: frontmatter.name,
            division: frontmatter.division,
            color: frontmatter.color,
            emoji: frontmatter.emoji,
            vibe: frontmatter.vibe,
            preferred_model: frontmatter.preferred_model,
            permissions: frontmatter.permissions,
            collaboration_style: if frontmatter.collaboration_style.is_empty() {
                "directive".to_string()
            } else {
                frontmatter.collaboration_style
            },
            communication_preference: if frontmatter.communication_preference.is_empty() {
                "structured".to_string()
            } else {
                frontmatter.communication_preference
            },
            decision_weight: if frontmatter.decision_weight == 0.0 {
                0.9
            } else {
                frontmatter.decision_weight
            },
            tools: frontmatter.tools,
            body: body.trim().to_string(),
        })
    }
}

fn split_frontmatter(contents: &str) -> Result<(&str, &str)> {
    let mut sections = contents.splitn(3, "---");
    let _ = sections.next();
    let Some(frontmatter) = sections.next() else {
        anyhow::bail!("persona file missing YAML frontmatter");
    };
    let Some(body) = sections.next() else {
        anyhow::bail!("persona file missing markdown body");
    };

    Ok((frontmatter.trim(), body))
}

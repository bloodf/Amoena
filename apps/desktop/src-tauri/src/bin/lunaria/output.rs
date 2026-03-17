use colored::Colorize;
use serde_json::Value;

pub fn print_json(value: &Value) {
    println!(
        "{}",
        serde_json::to_string_pretty(value).unwrap_or_else(|_| value.to_string())
    );
}

pub fn print_success(msg: &str) {
    println!("{} {}", "✓".green(), msg);
}

pub fn print_error(msg: &str) {
    eprintln!("{} {}", "✗".red(), msg);
}

pub fn print_warning(msg: &str) {
    println!("{} {}", "○".yellow(), msg);
}

pub fn print_detail(msg: &str) {
    println!("  {}", msg);
}

pub struct Table {
    headers: Vec<String>,
    rows: Vec<Vec<String>>,
}

impl Table {
    pub fn new(headers: Vec<&str>) -> Self {
        Self {
            headers: headers.into_iter().map(String::from).collect(),
            rows: Vec::new(),
        }
    }

    pub fn add_row(&mut self, row: Vec<String>) {
        self.rows.push(row);
    }

    pub fn is_empty(&self) -> bool {
        self.rows.is_empty()
    }

    pub fn print(&self) {
        if self.rows.is_empty() {
            println!("No items found.");
            return;
        }

        let col_count = self.headers.len();
        let mut widths: Vec<usize> = self.headers.iter().map(|h| h.len()).collect();
        for row in &self.rows {
            for (i, cell) in row.iter().enumerate() {
                if i < col_count {
                    widths[i] = widths[i].max(cell.len());
                }
            }
        }

        let top: String = widths
            .iter()
            .map(|w| "─".repeat(w + 2))
            .collect::<Vec<_>>()
            .join("┬");
        println!("┌{top}┐");

        let header_line: String = self
            .headers
            .iter()
            .enumerate()
            .map(|(i, h)| format!(" {:<width$} ", h, width = widths[i]))
            .collect::<Vec<_>>()
            .join("│");
        println!("│{header_line}│");

        let sep: String = widths
            .iter()
            .map(|w| "─".repeat(w + 2))
            .collect::<Vec<_>>()
            .join("┼");
        println!("├{sep}┤");

        for row in &self.rows {
            let line: String = (0..col_count)
                .map(|i| {
                    let cell = row.get(i).map(|s| s.as_str()).unwrap_or("");
                    format!(" {:<width$} ", cell, width = widths[i])
                })
                .collect::<Vec<_>>()
                .join("│");
            println!("│{line}│");
        }

        let bottom: String = widths
            .iter()
            .map(|w| "─".repeat(w + 2))
            .collect::<Vec<_>>()
            .join("┴");
        println!("└{bottom}┘");
    }
}

pub fn json_str<'a>(value: &'a Value, key: &str) -> &'a str {
    value.get(key).and_then(|v| v.as_str()).unwrap_or("-")
}

pub fn json_str_truncated(value: &Value, key: &str, max_len: usize) -> String {
    let s = json_str(value, key);
    if s.len() > max_len {
        format!("{}…", &s[..max_len - 1])
    } else {
        s.to_string()
    }
}

pub fn json_i64(value: &Value, key: &str) -> String {
    value
        .get(key)
        .and_then(|v| v.as_i64())
        .map(|n| n.to_string())
        .unwrap_or_else(|| "-".to_string())
}

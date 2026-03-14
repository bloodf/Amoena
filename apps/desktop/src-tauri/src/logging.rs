use std::sync::OnceLock;

use tracing_subscriber::{fmt, EnvFilter};

static LOGGING: OnceLock<()> = OnceLock::new();

pub fn init_logging() {
    LOGGING.get_or_init(|| {
        let filter = EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| EnvFilter::new("lunaria_desktop=info,info"));

        let _ = fmt()
            .with_env_filter(filter)
            .with_target(false)
            .json()
            .try_init();
    });
}

mod adapter;
mod manager;
mod process;

pub mod adapters;

pub use adapter::{
    AdapterHealth, NormalizedWrapperEvent, WrapperAdapter, WrapperAdapterCapabilities,
    WrapperAdapterConfig, WrapperExecutionRequest, WrapperPersonaExport, WrapperTurnOutcome,
};
pub use manager::WrapperManager;

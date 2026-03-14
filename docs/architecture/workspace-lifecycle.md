# Workspace Lifecycle Architecture

## Purpose

This document defines how Lunaria creates, tracks, reviews, applies, archives, and cleans up isolated workspaces.

## Workspace Types

- CoW clone
- git worktree
- full clone fallback

## Lifecycle States

- active
- archived
- deleted

Merge review states:

- pending
- approved
- blocked
- applied
- dismissed

## Required Operations

- create
- inspect
- diff
- archive
- destroy
- request merge review
- apply reviewed changes

## Merge / Apply Rule

- never automatic
- always manual review gate
- conflicts block apply-back

## Review Payload

Must include:

- source workspace
- source branch
- target branch
- changed file count
- conflict count
- per-file status summary
- human-readable summary

## Cleanup / Recovery

- persist every workspace
- background orphan scan
- manual cleanup controls
- reconnect interrupted stories/tasks to existing workspaces

## Acceptance Criteria

- every workspace is tracked
- merge review is explicit
- conflicts block apply-back
- crash recovery preserves recoverable work

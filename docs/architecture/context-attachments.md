# Context Attachments Architecture

## Purpose

This document defines Amoena's structured context attachment model for files and folders.

## Core Rule

Attachments are **reference-first**, not eager-content-first.

## Attachment Types

- `file_ref`
- `folder_ref`

## `file_ref`

Must include:

- `name`
- `path`
- optional `status`
- optional `previewSnippet`

Used when:

- user drags a file from file tree
- user drags a file from editor tab
- user drops a file from the OS
- user selects a file through explicit attach flow

## `folder_ref`

Must include:

- `name`
- `path`
- `itemCount`
- `truncated`
- optional `inferredTypes`

Used when:

- user drags a folder from file tree
- user drops a folder from the OS

Folder refs never inline all descendant file contents by default.

## Truncation Policy

Folder refs include a manifest summary, not full file bodies.

If the folder is too large:

- truncate manifest
- set `truncated = true`
- include file count summary
- include inferred type/language breakdown where available

## Runtime Behavior

The model receives the attachment reference summary in the user turn.
If it needs actual file contents, it must request them through tools.

## UX Behavior

- file tree supports drag to composer
- editor supports drag to composer
- OS drop supports files and folders
- attachment bar shows references distinctly
- user can remove references before send

## Acceptance Criteria

- files always become `file_ref`
- folders always become `folder_ref`
- folder drops never recursively inline all file bodies
- the same rules apply for internal drag and OS drag

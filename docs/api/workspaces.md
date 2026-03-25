# Workspaces API

Workspaces are managed project directories tracked by Amoena. They can be archived, inspected, and destroyed independently of sessions.

---

## List Workspaces

Returns all workspaces.

```
GET /api/v1/workspaces
Authorization: Bearer <token>
```

**Response `200`**

```json
[
  {
    "id": "ws_001",
    "name": "my-project",
    "rootPath": "/home/user/projects/my-project",
    "status": "active",
    "branchName": "main",
    "createdAt": "2025-01-10T08:00:00Z"
  }
]
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/workspaces \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const workspaces = await client.listWorkspaces();
```

---

## Create Workspace

Registers a new workspace directory.

```
POST /api/v1/workspaces
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "name": "my-project",
  "rootPath": "/home/user/projects/my-project",
  "branchName": "main"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Human-readable workspace name |
| `rootPath` | `string` | Yes | Absolute path to the workspace root |
| `branchName` | `string` | No | Git branch to associate |

**Response `200`**

```json
{
  "id": "ws_001",
  "name": "my-project",
  "rootPath": "/home/user/projects/my-project",
  "status": "active",
  "branchName": "main",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/workspaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-project",
    "rootPath": "/home/user/projects/my-project"
  }'
```

**TypeScript**

```typescript
const workspace = await client.createWorkspace({
  name: "my-project",
  rootPath: "/home/user/projects/my-project",
  branchName: "feat/new-feature",
});
```

---

## Inspect Workspace

Returns detailed information about a workspace, including its file listing.

```
GET /api/v1/workspaces/{workspaceId}
Authorization: Bearer <token>
```

**Response `200`**

```json
{
  "id": "ws_001",
  "name": "my-project",
  "rootPath": "/home/user/projects/my-project",
  "status": "active",
  "branchName": "main",
  "files": [
    { "name": "src", "path": "/home/user/projects/my-project/src", "type": "directory" },
    { "name": "README.md", "path": "/home/user/projects/my-project/README.md", "type": "file" }
  ]
}
```

**curl**

```bash
curl http://127.0.0.1:PORT/api/v1/workspaces/ws_001 \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const inspection = await client.inspectWorkspace(workspaceId);
```

---

## Archive Workspace

Marks a workspace as archived. The workspace record is retained but it is no longer shown as active.

```
POST /api/v1/workspaces/{workspaceId}/archive
Authorization: Bearer <token>
```

**Response `204`** — No content

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/workspaces/ws_001/archive \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
await client.archiveWorkspace(workspaceId);
```

---

## Destroy Workspace

Permanently deletes the workspace record. This does **not** delete files on disk.

```
DELETE /api/v1/workspaces/{workspaceId}
Authorization: Bearer <token>
```

**Response `204`** — No content

**curl**

```bash
curl -X DELETE http://127.0.0.1:PORT/api/v1/workspaces/ws_001 \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
await client.destroyWorkspace(workspaceId);
```

---

## Review Workspace

Triggers a workspace review — an AI-assisted analysis of the workspace contents (diffs, quality checks, etc.).

```
POST /api/v1/workspaces/{workspaceId}/reviews
Authorization: Bearer <token>
```

**Response `200`** — Review result object

**curl**

```bash
curl -X POST http://127.0.0.1:PORT/api/v1/workspaces/ws_001/reviews \
  -H "Authorization: Bearer $TOKEN"
```

**TypeScript**

```typescript
const review = await client.reviewWorkspace(workspaceId);
```

---

## File Browser

The file browser endpoints allow reading and writing individual files within the runtime's accessible directories.

### Get File Tree

```
GET /api/v1/files/tree?root={path}
Authorization: Bearer <token>
```

**Query parameters**

| Parameter | Description |
|-----------|-------------|
| `root` | Absolute directory path to list |

**Response `200`** — Nested `WorkspaceFileNode` tree

### Get File Content

```
GET /api/v1/files/content?path={path}
Authorization: Bearer <token>
```

**Response `200`**

```json
{
  "path": "/home/user/project/src/main.rs",
  "content": "fn main() { println!(\"Hello\"); }"
}
```

### Update File Content

```
POST /api/v1/files/content
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body**

```json
{
  "path": "/home/user/project/src/main.rs",
  "content": "fn main() { println!(\"World\"); }"
}
```

**Response `200`** — Updated file content response

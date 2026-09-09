---
name: docker-compose-up
description: |
  Brings up a project's Docker Compose stack the way Rita expects: start colima if it
  is not already running, clean ALL Docker containers/images/volumes first, then run
  `docker-compose up -d` and confirm the containers are healthy. Use whenever the user
  asks to run docker compose up, start the local docker dependencies (LocalStack,
  WireMock, etc.), or bring up the docker stack. Also triggers for phrases like
  "docker compose up", "start docker", "bring up the containers", or "start localstack".
---

# docker-compose-up

Bring up the project's Docker Compose stack. Two things are mandatory in Rita's workflow:

1. **colima** must be running first (Docker runs through colima).
2. **All Docker containers/images/volumes must be cleaned** before `docker-compose up`.

Note: this project's machine has the standalone `docker-compose` binary (v5.x), not the
`docker compose` plugin, so use `docker-compose` (hyphenated).

## Step 1: Start colima if needed

```bash
colima status
```

- If it reports `colima is not running`, start it:

  ```bash
  colima start
  ```

- If it is already running, skip to Step 2.

## Step 2: Verify Docker is reachable

```bash
docker info >/dev/null 2>&1 && echo "docker is running" || echo "docker is NOT running"
```

If Docker is not running after `colima start`, wait a moment and retry before continuing.

## Step 3: Clean ALL containers, images, and volumes

This is a full system cleanup (destructive). It removes every container (running or
stopped), every image, and unused volumes/networks before bringing the stack back up.

```bash
docker rm -f $(docker ps -aq) 2>/dev/null || true
docker system prune -a -f --volumes
```

- `docker rm -f $(docker ps -aq)` — force-removes all containers, including running ones.
- `docker system prune -a -f --volumes` — removes all images, volumes, and networks no
  longer referenced by a container (after the previous step, that is all of them).

If the project's compose file is already up, this also tears it down completely, so the
subsequent `up` starts from a clean slate.

## Step 4: Bring up the compose stack

Run from the directory that contains the `docker-compose.yml` (usually the project root):

```bash
docker-compose up -d
```

Use `docker-compose` (hyphenated). If that binary is missing, fall back to `docker compose`.

## Step 5: Confirm the containers are healthy

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Check that the expected services (e.g. `service_localstack`) are `Up` (and `healthy` where a healthcheck exists).
If a service has a healthcheck, wait for it to report `healthy` before running the build
or tests that depend on it.

## Error handling

- **`colima start` fails**: report the colima error; Docker will not be reachable.
- **`docker info` fails after colima start**: wait a few seconds and retry; colima may
  still be provisioning.
- **`docker-compose up` fails with port conflicts**: the cleanup in Step 3 may not have
  removed a container still holding the port — re-run Step 3 and retry.
- **Missing `docker-compose.yml`**: tell the user no compose file was found in the
  current directory; ask which project directory to use.

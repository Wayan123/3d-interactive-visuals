# Security Policy

## Supported versions

The project is early-stage. Security fixes target the `main` branch until versioned release support is formalized.

## Scope

The core app is a local educational WebGL viewer with a Python standard-library development server. Relevant security areas include:

- Local server path handling and static file serving.
- Privacy defaults for `/api/services` and optional probes.
- Supply-chain risk from browser CDN dependencies.
- User-contributed data in `cells.json`, docs, and screenshots.
- Optional CAD generation dependencies in `requirements-optional.txt`.

## Reporting a vulnerability

Please do not open public issues for sensitive vulnerabilities. Contact the maintainer through GitHub profile contact details, or open a minimal issue asking for a private security contact without disclosing details.

Helpful reports include:

- Affected file/endpoint.
- Reproduction steps.
- Expected vs actual behavior.
- Impact and suggested fix if known.

## Privacy defaults

The backend should not expose local home paths, tmux sessions, external service probes, or private host information unless an explicit environment variable enables it. Keep this default when adding new endpoints.

## Dependency notes

The runtime app intentionally avoids npm and pip dependencies. Three.js is loaded from a CDN on first use; optional CAD export dependencies are not required for browsing or teaching workflows.

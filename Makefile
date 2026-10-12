# Shortcuts for the jobs run by hand. Each target is a thin wrapper around an
# npm script, so `make help` is the list and package.json stays the source.

.DEFAULT_GOAL := help
.PHONY: help site-log-docs-sync effects-sync check dev preview

help: ## List the targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  make %-20s %s\n", $$1, $$2}'

site-log-docs-sync: ## Re-sync the SiteLog guides from site-log-ios's Markdown, test them, list what changed
	npm run docs:sync
	npx vitest run tests/synced-docs.test.ts
	@git status --short -- src/data/synced-docs public/synced-docs
	@echo "Review the pages with 'make preview', then commit: feat(docs): sync the SiteLog guides"

effects-sync: ## Re-read the effects library from Drive
	npm run effects:sync

check: ## Lint, typecheck and test: run before calling work done
	npm run lint
	npm run typecheck
	npm test

dev: ## Install, build the CV and start the dev server
	npm run dev

preview: ## Production build, served locally
	npm run preview

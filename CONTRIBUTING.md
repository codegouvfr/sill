# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue. We will than discuss the best way to implement it.

## Code rules

### Backend (API)

The buisness logic is in `api/src/core`. Which is split in different parts:

- `api/src/core/usecases`: contains the usecases that are called by the router. This orchestrates the flow of business logic. It should not be specific to the sources, and it should always use a port when accessing a source.
- `api/src/core/helpers`: contains the helpers that are used by the usecases. This can contain all the reusable business logic.
- `api/src/core/ports`: the contracts to discuss with the outside world and infrastructure (database, external APIs, etc.)
- `api/src/core/adapters`: the implementations of the ports. This is the only place where we should have code specific to the sources for example.
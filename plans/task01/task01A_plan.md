# Task1

## Objective
Create a reusable TypeScript utility function that converts Date objects into ISO 8601 date strings formatted as YYYY-MM-DD. This utility will be placed in a dedicated utils module, making it available across the codebase for consistent date formatting without relying on external libraries.

## Steps
1. Create a new file `src/utils/dateFormatter.ts` with a function `formatDateToISO` that accepts a Date object and returns a string in YYYY-MM-DD format
2. Add JSDoc comments and type annotations to `src/utils/dateFormatter.ts` documenting parameters, return type, and usage examples
3. Create `src/utils/index.ts` (or update if it exists) to export the `formatDateToISO` function for convenient importing

## Scope Boundary
- No changes to existing files outside the utils directory
- No integration with React components or other modules — this is a pure utility function only
- No timezone handling or localization — function assumes UTC/local system time
- No custom formatting patterns beyond YYYY-MM-DD (e.g., no optional separators or alternate formats)
- No unit tests (test file creation is a separate task)
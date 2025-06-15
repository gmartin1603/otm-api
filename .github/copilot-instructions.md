---
applyTo: "**"
---
# Project general coding standards

## Naming Conventions
- Use PascalCase for component names, interfaces, and type aliases
- Use camelCase for variables, functions, and methods
- Prefix private class members with underscore (_)

## Error Handling
- Use try/catch blocks for async operations
- Implement proper error boundaries
- Always log errors with contextual information

## Code Structure
- Organize code into modules and components
- Keep functions small and focused on a single task
- Justify the need for all dependencies when adding them
- Use descriptive names for functions and variables
- Avoid deeply nested structures; prefer early returns
- Use comments to explain complex logic, not obvious code

## Testing
- Use Mocha for unit tests
- Write unit tests for all public methods and components
- Use descriptive test names
- Ensure tests cover edge cases
- Use mocking for external dependencies in tests

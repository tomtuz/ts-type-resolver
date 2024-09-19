# Prettify TypeScript
## Features

- **Hover Information**: Just hover over a type, class, interface, etc., and you'll see a prettified version in the hover panel.

## Extension Settings

Prettify TS can be configured to customize your TypeScript development experience. Visual Studio Code extension settings can be found by navigating to the Settings editor and searching for the specific extension by name.

The following settings are available:

- **Type Indentation**: Controls the indentation level of types.
- **Max Depth**: Sets the maximum depth to which types should be expanded.
- **Max Properties**: Limits the number of properties displayed for each type. Excess properties will be displayed with ellipsis.
- **Max Sub-Properties**: Limits the number of sub-properties (properties on nested objects) displayed for each property. Excess properties will be displayed with ellipsis.
- **Max Union Members**: Limits the number of union members displayed for each union. Excess members will be displayed with ellipsis.
- **Unwrap Functions**: If enabled, function parameters and return types will be expanded.
- **Unwrap Arrays**: If enabled, array element types will be expanded.
- **Unwrap Promises**: If enabled, Promise resolved types will be expanded.
- **Hide Private Properties**: If enabled, hides private properties and methods.
- **Skipped Type Names**: A list of type names that should not be expanded.
- **Max Characters**: Sets the maximum number of characters for the prettified output. If the output exceeds this limit, it will be truncated.

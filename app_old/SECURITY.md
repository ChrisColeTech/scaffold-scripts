# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 3.x.x   | :white_check_mark: |
| 2.x.x   | :x:                |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### Private Disclosure

1. **Do not** create a public GitHub issue for security vulnerabilities
2. Email security details to: [INSERT_EMAIL] or use GitHub's private vulnerability reporting
3. Include as much detail as possible about the vulnerability
4. Allow us reasonable time to respond before any public disclosure

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 1 week
- **Fix Timeline**: Varies based on complexity, but we aim for 30 days maximum

### Security Best Practices

When using Scaffold Scripts:

1. **Script Validation**: Always review scripts before adding them to your library
2. **Source Trust**: Only add scripts from trusted sources
3. **Permissions**: Be aware that scripts run with your user permissions
4. **Regular Updates**: Keep the package updated to the latest version

### Known Security Considerations

- Scripts execute with the same permissions as the user running them
- Scripts can access environment variables and system resources
- Automatic script conversion between platforms should be reviewed before execution
- Interactive input handling may expose sensitive information in logs

## Security Features

Scaffold Scripts includes several security features:

- Script validation before execution
- Platform-specific security warnings
- Controlled execution environment
- No automatic script downloads or remote execution

For questions about security, please contact the maintainers.
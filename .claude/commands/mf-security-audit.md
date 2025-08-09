---
description: Perform a security audit on Module Federation configuration
---

# Module Federation Security Audit

Conduct a comprehensive security audit of the Module Federation setup.

## Audit Checklist:
1. **Remote Module Validation**
   - Check for HTTPS enforcement
   - Verify origin allowlisting
   - Review CORS configuration
   - Check for integrity hashes

2. **Content Security Policy**
   - Verify CSP headers are properly configured
   - Check for unsafe-eval usage (required for MF)
   - Review allowed sources

3. **Authentication**
   - Ensure Keycloak tokens are properly handled
   - Check for token leakage in remote communications
   - Verify secure token exchange

4. **Dependencies**
   - Audit shared dependencies for vulnerabilities
   - Check for version conflicts
   - Review singleton configurations

5. **Runtime Security**
   - Check for XSS vulnerabilities
   - Review error handling
   - Verify input sanitization

## Usage:
/mf-security-audit

## Output:
- Security report with findings
- Risk assessment (Critical/High/Medium/Low)
- Remediation recommendations
- Implementation examples
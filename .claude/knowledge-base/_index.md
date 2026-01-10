# Knowledge Base Index

## Tags

### By Component
- `gemini-api` - Gemini API issues
- `image-generation` - Generation process
- `prompt` - Prompt engineering
- `uv` - UV package manager
- `ui` - UI/Frontend component issues

### By Error Type
- `rate-limit` - Rate limiting errors
- `timeout` - Timeout errors
- `auth` - Authentication errors
- `validation` - Input validation errors
- `api-key` - API key issues
- `permission` - Permission/access errors
- `quota` - Quota exhausted errors

### By Severity
- `critical` - Blocks all work
- `high` - Significant impact
- `medium` - Workaround available
- `low` - Minor inconvenience

## Quick Reference

### Most Common Issues
1. [API Key Not Found](api/api-key-not-found.md) - Missing GOOGLE_API_KEY
2. [Rate Limit 429](api/rate-limit-429.md) - Quota exhausted errors
3. [Invalid API Key](api/invalid-api-key.md) - Auth failures
4. [Permission Denied](api/permission-denied.md) - Access issues

### By Category

#### API Issues (`api/`)
| Issue | Tags | Severity |
|-------|------|----------|
| [API Key Not Found](api/api-key-not-found.md) | auth, api-key | critical |
| [Invalid API Key](api/invalid-api-key.md) | auth, api-key | critical |
| [Permission Denied](api/permission-denied.md) | auth, permission | high |
| [Rate Limit 429](api/rate-limit-429.md) | rate-limit, quota | medium |

#### Generation Issues (`generation/`)
| Issue | Tags | Severity |
|-------|------|----------|
| [4K Requires Pro Model](generation/4k-requires-pro-model.md) | model, size | low |
| [No Image Generated](generation/no-image-generated.md) | response, empty-result | medium |

#### General Issues (`general/`)
| Issue | Tags | Severity |
|-------|------|----------|
| [UV Not Installed](general/uv-not-installed.md) | uv, installation | critical |

#### UI Issues (`ui/`)
| Issue | Tags | Severity |
|-------|------|----------|
| [Scroll Propagation in Sidebar](ui/scroll-propagation-sidebar.md) | ui, scroll, radix | medium |

### Recent Additions
- 2026-01-07: Initial KB entries created
  - API authentication issues (4 entries)
  - Generation issues (2 entries)
  - General setup issues (1 entry)
- 2026-01-07: UI pattern entry added
  - Scroll propagation fix for nested containers (1 entry)

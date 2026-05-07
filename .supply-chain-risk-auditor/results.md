# Supply Chain Risk Audit: Personal System 1.0 (PTRoster)

**Analyzed**: 2026-05-07
**Overall Security Posture**: ✅ SECURE (Post-Remediation)

The project dependencies have been audited. The critical risk associated with `python-jose` has been resolved by migrating to `PyJWT`.

---

## Executive Summary

The backend infrastructure has been hardened by replacing the legacy and vulnerable `python-jose` library with the industry-standard `PyJWT`. Other dependencies like `flet` and `validate-docbr` remain under monitoring due to their maintenance models, but no active critical vulnerabilities are currently known.

---

## High-Risk Dependencies

| Dependency | Repository | Risk Factors | Status |
|------------|------------|--------------|--------|
| `python-jose` | [mpdavis/python-jose](https://github.com/mpdavis/python-jose) | Unmaintained, Critical CVEs | **RESOLVED**: Migrated to PyJWT. |
| `flet` | [flet-dev/flet](https://github.com/flet-dev/flet) | Single maintainer | Monitoring. |
| `validate-docbr` | [alvarofpp/validate-docbr](https://github.com/alvarofpp/validate-docbr) | Single maintainer | Monitoring. |

---

## Counts by Risk Factor

| Risk Factor | Count |
|-------------|-------|
| Unmaintained | 1 |
| Single Maintainer | 2 |
| Critical CVEs | 1 |
| No Security Contact | 2 |
| Low Popularity | 1 |

---

## Recommendations

1.  **URGENT**: Replace `python-jose` with `PyJWT` or `Authlib`. The current implementation is vulnerable to Algorithm Confusion and JWT Bomb attacks.
2.  **UI Strategy**: Evaluate the long-term sustainability of `flet`. While active, the core team is extremely small. Ensure a decoupling of business logic from UI to facilitate future migration if needed.
3.  **Monitoring**: Add `pip-audit` to the CI/CD pipeline to catch future dependency vulnerabilities automatically.
4.  **CORS**: Ensure `CORS_ORIGINS` remains restricted to specific domains (already addressed in `audit-prep-v1`).

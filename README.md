# Catalogi

## A Software Catalog application

This repository contains the catalogi software, a web application to manage
a catalog of software.

## Full documentation

The full documentation is available [here](https://codegouvfr.github.io/catalogi/)

## It is deployed on several places

1. [https://code.gouv.fr/sill](https://code.gouv.fr/sill/) for the
list of recommanded Free Software for French administrations.
2. [https://logiciels.catalogue-esr.fr/](https://logiciels.catalogue-esr.fr/) for the CNRS, listing mostly HAL softwares.

## Code organization

This "monorepo" is made of several directories:

- api: Application API (also includes jobs, that can be run periodically)
- web: Web frontend
- docs: Documentation, as deployed [here](https://codegouvfr.github.io/catalogi/)
- deploy-examples: Examples of deployment. For now, there is only a Docker Compose example.

## Governance and contributions

[![img](https://img.shields.io/badge/code.gouv.fr-contributif-blue.svg)](https://code.gouv.fr/documentation/#quels-degres-douverture-pour-les-codes-sources)

See [GOVERNANCE.md](GOVERNANCE.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## License

2021-2025 Direction interministérielle du numérique, mission logiciels libres.

The code in this repository is published under [licence MIT](LICENSES/MIT.txt).

The documentation is published under [licence Ouverte 2.0](LICENSES/Etalab-2.0.md).

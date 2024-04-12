## Deployment

Bare metal:

* Prod: [https://code.gouv.fr/sill](https://code.gouv.fr/sill)

Via [codegouvfr/paris-sspcloud](https://github.com/codegouvfr/paris-sspcloud)

* Preprod: [apps/sill-preprod](https://github.com/codegouvfr/paris-sspcloud/tree/main/apps/sill-preprod) -> [https://sill-preprod.lab.sspcloud.fr](https://sill-preprod.lab.sspcloud.fr)

## Source code

All the source code is hosted on this repository.

The repository is the source code for 3 differents apps :

* `/web`: The web application, runs in the browser. The site is here : [https://code.gouv.fr/sill](https://code.gouv.fr/sill)
* `/api`: The RPC API consumed by the web application.
* `/docs`: The documentation. It is hosted on [https://codegouvfr.github.io/sill](https://codegouvfr.github.io/sill)

The data is hosted on separate repositories:
* [codegouvfr/sill-data](https://github.com/codegouvfr/sill-data): Production database (private repository).
* [codegouvfr/sill-data-test](https://github.com/codegouvfr/sill-data-test): Preprod database
* [codegouvfr/sill-data-template](https://github.com/codegouvfr/sill-data-template): Template for creating new database.


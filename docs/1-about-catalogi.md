# Catalogi

Catalogi is a tool that provide a catalog of software packages. 
It allows to list, search and manage softwares docs in a web application.

## Known deployments

The catalogi software is deployed on different places, such as :


1. [https://code.gouv.fr/sill](https://code.gouv.fr/sill/) for the
list of recommanded Free Software for French administrations.
1. [https://logiciels.catalogue-esr.fr/](https://logiciels.catalogue-esr.fr/) for the French Research Minister, listing mostly HAL softwares.


[Summary](_sidebar.md)

Doc deployment (folder `/docs`) uses [docsify-dsfr-template](https://github.com/codegouvfr/docsify-dsfr-template).

## Source code

All the source code is hosted on the monorepo : [https://github.com/codegouvfr/catalogi](https://github.com/codegouvfr/catalogi).

It is the source code for 3 differents apps :

* `/web`: The web application, runs in the browser.
* `/api`: The RPC API consumed by the web application. The code for different jobs is also in this folder.
* `/docs`: The documentation. It is hosted on [https://codegouvfr.github.io/sill](https://codegouvfr.github.io/sill)

The data is kept in a postgres database .

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

2021-2025 Direction interministérielle du numérique, mission logiciels libres.

Catalogi code is published under [licence MIT](LICENSES/MIT.txt).

The documentation is published under [licence Ouverte 2.0](LICENSES/Etalab-2.0.md)

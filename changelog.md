CHANGELOG
=========

1.1.0    (unreleased)
----------------------

**Warning**

- `NG_APP_API_URL` setting in `.env` has to be updated to include `/api/`

1.0.6    (2024-07-31)
----------------------

**Improvements**

- Rename obs -> evenements + make offline page accessible when not connected

**Bugfix**

- Sort observations by alphabetical order on synthesis interface

1.0.5    (2024-07-31)
----------------------

**Improvements**

- Add delay between tiles download

1.0.4    (2024-07-30)
----------------------

**Improvements**

- Improve UI

**Bugfix**

- Handle sub category on primary category filter

1.0.3    (2024-07-25)
----------------------

**Bugfix**

- Fix offline tiles download
- Improve frontend documentation

1.0.2    (2024-07-24)
----------------------

**Bugfix**

- Fix Import data command
- Fix offline tiles download

**Improvements**

- Improve UI

1.0.1    (2024-07-24)
----------------------

**Improvements**

- Default NGINX configuration now redirect to backend when admin or api url does not have trailing /.
- Category ordering in admin panel
- Add `import_data` command to import data from old LizMap GeoJSON file.
- Improve home UI and "learn more" page
- Fix default `custom.py` config file

1.0.0        (2024-07-19)
-------------------------

Première version déployable autonome.

* Fontend en Angular
* Backend en Python / Django / PostGIS

**🎉 Features**

* V1 by @submarcos in https://github.com/PnEcrins/RGAlt/pull/26

0.0.1        (2024-07-17)
-------------------------

Première version du projet Regards d'altitude, sous forme de BDD uniquement, sur laquelle a été basée un projet QGIS / Lizmap.

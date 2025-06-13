CHANGELOG
=========

**Improvements**

- Improve observation API to handle
  - JSON and GeoJSON content and pagination
  - In BBox filter
  - Ordering content by field
  - Default ordering by decrease event date

- Add statistics


1.1.2     (2024-11-27)
----------------------

**Bugfix**

- Revert changes about `NG_APP_API_URL`. No need to change it in production environments.

1.1.1    (2024-11-26)
---------------------

**Improvements**

- Upgrade several dependencies

1.1.0    (2024-11-25)
---------------------

**Improvements**

- Improve observations list UI (#133)
- Improve synthesis UI (#143)
- Restore synthesis interface context (#144)
- Improve map configuration (#145)
- Allow to skip steps on new observation (#149)
- Improve display of the new observation map (#146)
- Allow to edit observation (#147)
- Allow to delete observation (#162)
- Remove hard-coded `/api/` in `NG_APP_API_URL` setting in `.env` file (#165)
- Improve "My offline data" UI (#166)
- Upgrade several dependencies

**Bugfix**

- Add missing icons (128x128.png and 384x384.png)

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

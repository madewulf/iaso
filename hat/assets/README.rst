***************
Frontend assets
***************

Frontend assets include JS, CSS, translations and images. They are all handled
by webpack. Most of the structure is taken from this blog post:
http://owaislone.org/blog/webpack-plus-reactjs-and-django/

Frontend assets are mounted on the pages via the
`django-webpack-loader <https://github.com/owais/django-webpack-loader>`__


Build
=====

The 2 builds, dev and prod
--------------------------

* There are two webpack configuration files: ``webpack.dev.js`` and ``webpack.prod.js``.

* A JS production build is created inside the docker-file, via ``npm run build``

* the ``start_dev`` entry point starts a webpack development server, that watches
  assets, rebuilds and does hot reloading of JS Components.


CSS Build
---------

The CSS build is separate, and can contain both ``.sass`` and ``.css`` files.
They spit out a webpack build called ``styles.css``.


JS Build
--------

Each page has their own JS entry point (needs to be defined in both webpack files).
On top of that, they load a common chunk, containing ``react``, ``react-intl`` and other
stuff that the ``webpack common chunk`` plugin finds is shared between the apps.


Including a JS bundle via django-webpack-loader
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If we have created a new JS app ``MyCustomApp`` in ``hat/assets/js/apps/``.

The entrypoint should be ``/dashboard/my-custom-app``

Folders and files affected::

    + hat/
      + assets/
        + js/
          + apps/
            + MyCustomApp
              . index.js
              . MyCustomApp.js
              . MyCustomAppContainer.js

      + dashboard/
        . urls.py
        . views.py

      + templates/
        + dashboard/
          . my_custom_app.html

      . webpack.dev.js
      . webpack.prod.js


These are the steps to visualize it within the dashboard:

- In ``hat/webpack.dev.js`` include a new ``entry``.

  .. code:: javascript

      'my_custom_app': [
        'webpack-dev-server/client?' + WEBPACK_URL,
        'webpack/hot/only-dev-server',
        './assets/js/apps/MyCustomApp/index'
      ],


- In ``hat/webpack.prod.js`` include a new ``entry``.

  .. code:: javascript

      'my_custom_app': './assets/js/apps/MyCustomApp/index',


- In ``hat/dashboard/views.py`` include a new view.

  .. code:: python

      @login_required()  # needs login?
      @permission_required('cases.view')  # the needed permissions
      @require_http_methods(['GET'])  # http methods allowed
      def my_custom_app(request: HttpRequest) -> HttpResponse:
          return render(request, 'dashboard/my_custom_app.html')


- In ``hat/dashboard/urls.py`` include a new url pattern.

  .. code:: python

      url(r'^my-custom-app/.*$', views.my_custom_app, name='my_custom_app'),


- In ``hat/templates/dashboard`` create a new template file ``my_custom_app.html``.

  .. code:: html

      {% extends 'app.html' %}
      {% load i18n %}
      {% load render_bundle from webpack_loader %}

      {% block header %}
        <h1 class="header__title">{% trans 'My Custom App' %}</h1>
      {% endblock %}

      {% block content %}

        <div class="content">
          <div id="app-container"></div>
        </div>

        {% render_bundle 'common' %}
        {% render_bundle 'my_custom_app' %}
        <script>
          HAT.MyCustomApp.default(
            document.getElementById('app-container'),
            '/dashboard/my-custom-app/'
          )
        </script>
      {% endblock %}


Testing the production build
============================

#. Stop any containers that might be currently running.
#. Start the containers with:

   .. code:: shell

      TEST_PROD=true docker-compose up

When the setup is run with ``TEST_PROD=true``, it will exit the unneeded containers
``webpack`` and ``jupyter``. It will also run the webpack build during startup, so
that there is no need to rebuild the image for that.

JS Unit Testing
---------------

.. code:: shell

    docker-compose run hat test_js


Adding new assets in package.json
=================================

Unfortunately, for now you need to rebuild the container after adding or
upgrading packages in ``package.json``.

.. code:: shell

    docker-compose build

or

.. code:: shell

    docker-compose up --build


Translations
============

Translations are extracted on the first webpack build. Just like the django
translation strings; translations are downloaded for every `Travis CI <https://travis-ci.com>`__
build, and uploaded on the ``development`` branch.

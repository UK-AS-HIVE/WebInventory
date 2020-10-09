#!/bin/bash
set -x

WEBINVENTORY_APP_URL=http://localhost:3000

# Example Wordpress site
WP_HOST=wordpress.example.site #$(hostname -f)
WP_DIR=/var/www/wp-example #$(pwd)
WP_PLUGIN_VERSIONS='[{"name":"add-to-any","status":"active","update":"available","version":"1.7.26"},{"name":"child-theme-configurator","status":"active","update":"available","version":"2.3.0.4"},{"name":"disable-comments","status":"active","update":"available","version":"1.7.1"},{"name":"google-analytics-dashboard-for-wp","status":"active","update":"available","version":"5.3.5"},{"name":"mailchimp-for-wp","status":"active","update":"available","version":"4.2.3"},{"name":"wp-smushit","status":"active","update":"none","version":"2.7.9.1"},{"name":"wpcustom-category-image","status":"active","update":"none","version":"2.1.13"}]' #$(wp plugin list --status=active --format=json)
WP_CORE_VERSION=5.1.6 #$(wp core version)
curl -X POST -H "Content-Type:application/json" -d "{\"host\": \"${WP_HOST}\", \"siteroot\": \"${WP_DIR}\", \"version\": \"${WP_CORE_VERSION}\", \"plugins\": ${WP_PLUGIN_VERSIONS}}" ${WEBINVENTORY_APP_URL}/api/wordpressSiteInfo #> /dev/null 2>&1

# Example Drupal 7 site
D7_HOST=d7.example.site #$(hostname -f)
D7_DIR=/var/www/d7-example
D7_MODULE_VERSIONS='{"block":"7.67","webform":"7.x-4.20","color":"7.67","comment":"7.67","contextual":"7.67","ctools":"7.x-1.15","dashboard":"7.67","dblog":"7.67","draggableviews":"7.x-2.1","entity":"7.x-1.9","field":"7.67","field_sql_storage":"7.67","field_ui":"7.67","file":"7.67","filter":"7.67","help":"7.67","image":"7.67","list":"7.67","menu":"7.67","node":"7.67","node_export":"7.x-3.1","number":"7.67","options":"7.67","path":"7.67","rdf":"7.67","search":"7.67","shortcut":"7.67","system":"7.67","taxonomy":"7.67","text":"7.67","toolbar":"7.67","triage_webforms":null,"user":"7.67","uuid":"7.x-1.3","views_ui":"7.x-3.23","webform_layout":"7.x-2.3","views":"7.x-3.23","devel":"7.x-1.7","standard":"7.67"}' #$(drush eval "print_r(json_encode(array_map(function(\$m) { return system_get_info('module', \$m)['version']; }, array_filter(module_list(), function(\$m) { return module_exists(\$m); }))));")
curl -X POST -H "Content-Type:application/json" -d "{\"host\": \"${D7_HOST}\", \"siteroot\": \"${D7_DIR}\", \"moduleVersions\": ${D7_MODULE_VERSIONS}}" ${WEBINVENTORY_APP_URL}/api/drupalSiteInfo #> /dev/null 2>&1


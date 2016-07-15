#!/bin/bash

# run this on any web server which has a drupal site

export PATH=$PATH:/usr/local/bin
for DRUPALROOT in `locate -b 'modules' | grep -e 'sites/all/modules$' | grep -e '^/var/www' | sed "s/sites\/all\/modules$//"`
do
  cd ${DRUPALROOT}

  MODULE_VERSIONS=$(drush eval "print_r(json_encode(array_map(function(\$m) { return system_get_info('module', \$m)['version']; }, array_filter(module_list(), function(\$m) { return module_exists(\$m); }))));")
  curl -X POST -H "Content-Type:application/json" -d "{\"host\": \"`hostname -f`\", \"siteroot\": \"`pwd`\", \"moduleVersions\": ${MODULE_VERSIONS}}" https://meteordev.as.uky.edu/WebInventory/api/drupalSiteInfo

done


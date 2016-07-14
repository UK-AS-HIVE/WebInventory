@DrupalSites = new Mongo.Collection 'drupalSites'
###
DrupalModules.attachSchema new SimpleSchema
  host: type: String
  siteroot: type: String
  moduleVersions:
    type: Object
    blackbox: true
###

Router.route '/', ->
  @render 'home'

###
# Can post output of:
drush eval "print_r(json_encode(array_map(function(\$m) { return system_get_info('module', \$m)['version']; }, array_filter(module_list(), function(\$m) { return module_exists(\$m); }))));"`
###
Router.route '/api/drupalSiteInfo', {where: 'server'}
  .post ->
    d = @request.body
    DrupalSites.upsert {host: d.host, siteroot: d.siteroot},
      $set:
        moduleVersions: d.moduleVersions
    @response.end 'Okay Thanks!'

if Meteor.isClient
  Template.home.helpers
    knownSiteCount: ->
      DrupalSites.find().count()


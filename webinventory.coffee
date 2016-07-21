DrupalSites = new Mongo.Collection 'drupalSites'
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

Router.route '/drupal/site/:siteId', ->
  @render 'drupalSiteDetail', data: @params

Router.route '/drupal/module/:moduleName', ->
  @render 'drupalModuleDetail', data: @params

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
    drupalSites: ->
      DrupalSites.find()
    moduleCount: ->
      _.size @moduleVersions
    knownModulePivot: ->
      modules = {}
      DrupalSites.find().forEach (site) ->
        _.each site.moduleVersions, (v, m) ->
          unless modules[m]?
            modules[m] = {}
          modules[m]["#{site.host}:#{site.siteroot}"] = v
      console.log modules
      modules
    knownModuleCount: -> _.size @
    knownModule: ->
      _.map @, (v, k) ->
        module: k
        versionCount: _.size _.countBy(v)
        siteCount: _.size(v)

  Template.drupalSiteDetail.helpers
    site: ->
      DrupalSites.findOne @siteId
    moduleVersions: ->
      _.map @moduleVersions, (v, k) -> {name: k, version: v}

  Template.drupalModuleDetail.helpers
    siteCount: ->
      selector = {}
      selector['moduleVersions.' + @moduleName] = {$exists: true}
      DrupalSites.find(selector).count()
    sites: ->
      selector = {}
      selector['moduleVersions.' + @moduleName] = {$exists: true}
      DrupalSites.find(selector)
    version: ->
      @moduleVersions[Template.parentData().moduleName]


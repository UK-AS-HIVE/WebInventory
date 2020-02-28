import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Mongo} from 'meteor/mongo';

import {Router} from 'meteor/iron:router';

//import './imports/autotable/autotable';

const DrupalSites = new Mongo.Collection('drupalSites');

/*
DrupalSites.attachSchema new SimpleSchema
  host: type: String
  siteroot: type: String
  lastUpdated: type: new Date()
  type:
    type: String
    allowedValues: ['WordPress', 'Drupal 7']
  moduleVersions: // Drupal only
    type: Object
    blackbox: true
  plugins: // WP only
    type: Object
    blackbox: true
 */

Router.route('/', function() {
  return this.render('home');
});

Router.route('/drupal/site/:siteId', function() {
  return this.render('drupalSiteDetail', {
    data: this.params
  });
});

Router.route('/drupal/module/:moduleName', function() {
  return this.render('drupalModuleDetail', {
    data: this.params
  });
});


/*
 * Can post output of:
drush eval "print_r(json_encode(array_map(function(\$m) { return system_get_info('module', \$m)['version']; }, array_filter(module_list(), function(\$m) { return module_exists(\$m); }))));"`
 */

Router.route('/api/drupalSiteInfo', {
  where: 'server'
}).post(function() {
  var d;
  d = this.request.body;
  DrupalSites.upsert({
    host: d.host,
    siteroot: d.siteroot
  }, {
    $set: {
      type: 'Drupal 7',
      lastUpdated: new Date(),
      moduleVersions: d.moduleVersions
    }
  });
  return this.response.end('Okay Thanks!');
});

Router.route('/api/wordpressSiteInfo', {
  where: 'server'
}).post(function() {
  const d = this.request.body;
  DrupalSites.upsert({
    host: d.host,
    siteroot: d.siteroot
  }, {
    $set: {
      type: 'WordPress',
      lastUpdated: new Date(),
      plugins: d.plugins
    }
  });
  return this.response.end('Okay Thanks!');
});

if (Meteor.isClient) {
  Template.home.helpers({
    knownSiteCount: function() {
      return DrupalSites.find().count();
    },
    drupalSites: function() {
      return DrupalSites.find();
    },
    moduleCount: function() {
      return _.size(this.moduleVersions);
    },
    datestamp: function(d) {
      return d != null ? d.toLocaleDateString() : void 0;
    },
    knownModulePivot: function() {
      var modules;
      modules = {};
      DrupalSites.find().forEach(function(site) {
        return _.each(site.moduleVersions, function(v, m) {
          if (modules[m] == null) {
            modules[m] = {};
          }
          return modules[m][site.host + ":" + site.siteroot] = v;
        });
      });
      console.log(modules);
      return modules;
    },
    knownModuleCount: function() {
      return _.size(this);
    },
    knownModule: function() {
      return _.map(this, function(v, k) {
        return {
          module: k,
          versionCount: _.size(_.countBy(v)),
          siteCount: _.size(v)
        };
      });
    }
  });
  Template.drupalSiteDetail.helpers({
    site: function() {
      return DrupalSites.findOne(this.siteId);
    },
    moduleVersions: function() {
      return _.map(this.moduleVersions, function(v, k) {
        return {
          name: k,
          version: v
        };
      });
    }
  });
  Template.drupalModuleDetail.helpers({
    siteCount: function() {
      var selector;
      selector = {};
      selector['moduleVersions.' + this.moduleName] = {
        $exists: true
      };
      return DrupalSites.find(selector).count();
    },
    sites: function() {
      var selector;
      selector = {};
      selector['moduleVersions.' + this.moduleName] = {
        $exists: true
      };
      return DrupalSites.find(selector);
    },
    version: function() {
      return this.moduleVersions[Template.parentData().moduleName];
    }
  });
}

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Mongo} from 'meteor/mongo';

import {Router} from 'meteor/iron:router';

//import './imports/autotable/autotable';

interface SiteBase {
  accessUrl?: string;
  owner?: string;
  host: string;
  siteroot: string;
  lastUpdated: Date;
}

interface Drupal7Site {
  modules: {
    name: string;
    version: string;
  }[];
}

interface WordPressSite {
  plugins: {
    name: string;
    version: string;
  }[];
}

type Site = SiteBase & (Drupal7Site | WordPressSite)
const DrupalSites = new Mongo.Collection<Site>('drupalSites');
if (Meteor.isClient) {
  (window as any).DrupalSites = DrupalSites;
}

/*DrupalSites.attachSchema(new SimpleSchema({
  host: {type: String},
  siteroot: {type: String},
  lastUpdated: {type: new Date()},
  type: {
    type: String,
    allowedValues: ['WordPress', 'Drupal 7']
  },
  moduleVersions: { // Drupal only
    type: Object,
    optional: true,
    blackbox: true
  },
  'moduleVersions.$.name': { type: String},
  'moduleVersions.$.version': {type: String},
  plugins: { // WP only
    type: Object,
    optional: true,
    blackbox: true
  },
  'plugins.$.name': { type: String},
  'plugins.$.version': {type: String}
}));*/

Router.route('/', function() {
  return this.render('home');
});

Router.route('/site/:siteId', function() {
  return this.render('siteDetail', {
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
  const d = this.request.body;
  DrupalSites.upsert({
    host: d.host,
    siteroot: d.siteroot
  }, {
    $set: {
      type: 'Drupal 7',
      lastUpdated: new Date(),
      moduleVersions: _.map(d.moduleVersions, (v, i) {
        return {
          name: i,
          version: v
        }
      })
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
        if (site.modules) {
          return _.each(site.modules, function(v, m) {
            if (modules[m] == null) {
              modules[m] = {};
            }
            return modules[m][site.host + ":" + site.siteroot] = v;
          });
        }
      });
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
  Template.siteDetail.helpers({
    site: function() {
      const site = DrupalSites.findOne(this.siteId);
      return site;
    },
    drupalModuleVersions: function() {
      return _.map(this.moduleVersions, function(v, k) {
        return {
          name: k,
          version: v
        };
      });
    },
    count: function(ary : Array<any>) {
      return ary.length;
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

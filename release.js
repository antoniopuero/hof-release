#!/usr/bin/env node
var fs = require('fs'),
  async = require('async'),
  bower = require(process.cwd() +'/bower.json'),
  exec = require('child_process').exec;
async.waterfall([
  function (callback) {
    exec('git status', function (error, stdout, stderr) {
        if (error) {
          throw new Error(error);
        } else if (stdout.indexOf('Changes not staged') > -1) {
          throw new Error('Changes was not staged. Please, commit your previous changes.');
        } else {
          callback(null);
        }
    });
  },
  function (callback) {
    var oldSnapshotVersion = bower.version;
    if (oldSnapshotVersion.indexOf('-SNAPSHOT') < 0) {
      throw Error('not snapshot version. Plese check your version');
    } else {
      bower.version = oldSnapshotVersion.replace('-SNAPSHOT', '');
      callback(null, oldSnapshotVersion);
    }
  },
  function (oldSnapshot, callback) {
    exec('git tag -d ' + oldSnapshot, function (error, stdout, stderr) {
        if (error) {
          throw new Error(error);
        } else {
          console.log('delete old tag ' + oldSnapshot);
          callback(null, oldSnapshot);
        }
    });
  },
  function (oldSnapshot, callback) {
    exec('git push origin :refs/tags/' + oldSnapshot, function (error, stdout, stderr) {
      if (error) {
        throw new Error(error);
      } else {
        console.log('delete  from remote repo old tag ' + oldSnapshot);
        callback(null, bower.version);
      }
    })
  },
  function (version, callback) {
    fs.writeFile(process.cwd() + '/bower.json', JSON.stringify(bower, null, 2), function(err) {
      if(err) {
        throw new Error(err);
      } else {
        console.log('write old version to bower.json file ' + version);
        callback(null, version);
      }
    });
  },
  function (version, callback) {
    exec('git commit -am "bump old version ' + version + '"', function (error, stdout, stderr) {
      if (error) {
        throw new Error(error);
      } else {
        console.log('commit old bower version ' + version);
        callback(null, version);
      }
    });
  },
  function (version, callback) {
    exec('git tag ' + version, function (error, stdout, stderr) {
      if (error) {
        throw new Error(error);
      } else {
        console.log('tag old version ' + version);
        callback(null, version);
      }
    });
  },
  function (version, callback) {
    exec('git push', function (error, stdout, stderr) {
      if (error) {
        throw new Error(error);
      } else {
        console.log('push bower.json');
        callback(null, version);
      }
    });
  },
  function (version, callback) {
    exec('git push origin ' + version, function (error, stdout, stderr) {
      if (error) {
        throw new Error(error);
      } else {
        console.log('push old tag ' + version);
        callback(null, version);
      }
    });
  },
  function (version, callback) {
    var versions = version.split('.'),
        newVersion;
    versions[1] = parseInt(versions[1], 10) + 1;
    versions[2] = 0;
    newVersion = versions.join('.') + '-SNAPSHOT';
    bower.version = newVersion;
    callback(null, newVersion);
  },
  function (newVersion, callback) {
    fs.writeFile(process.cwd() + '/bower.json', JSON.stringify(bower, null, 2), function(err) {
      if(err) {
        throw new Error(err);
      } else {
        console.log('write new version to bower.json ' + newVersion);
        callback(null, newVersion);
      }
    });
  },
  function (newVersion, callback) {
    exec('git commit -am "bump for release ' + newVersion + '"', function (error, stdout, stderr) {
      if (error) {
        throw new Error(error);
      } else {
        console.log('commit new version ' + newVersion);
        callback(null, newVersion);
      }
    });
  },
  function (newVersion, callback) {
    exec('git tag ' + newVersion, function (error, stdout, stderr) {
      if (error) {
        throw new Error(error);
      } else {
        console.log('tagged new version ' + newVersion);
        callback(null, newVersion);
      }
    });
  },
  function (newVersion, callback) {
    exec('git push', function (error, stdout, stderr) {
      if (error) {
        throw new Error(error);
      } else {
        console.log('pushing new version ' + newVersion);
        callback(null, newVersion);
      }
    });
  },
  function (newVersion, callback) {
    exec('git push origin ' + newVersion, function (error, stdout, stderr) {
      if (error) {
        throw new Error(error);
      } else {
        console.log('pushing new tag ' + newVersion);
        callback(null, newVersion);
      }
    });
  }
],
function (err, result) {
   if (err) {
    throw new Error(err);
   } else {
    console.log('Build created: ' + result);
   }
});

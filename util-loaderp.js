/**
 * Extends cc with loaderp (promisified loader)
 */
if (cc && cc.loader) {
  const loader = cc.loader;
  const loaderp = cc.loaderp = {};

  var promisify = function (method) {
    return function (...args) {
      return new Promise((rs, rj) => {
        args.push((err, data) => {
          if (err) {
            rj(err);
          } else {
            rs(data);
          }
        });
        loader[method].apply(loader, args)
      })
    };
  };

  /**
   * Promisified cc.loader.loadRes
   */
  loaderp.loadRes = promisify('loadRes');

  /**
   * Promisified cc.loader.load
   */
  loaderp.load = promisify('load')

  /**
   * Load multiple resource
   * const resources = [
   *  ['atlas', cc.SpriteAtlas],
   *  ['json']
   * ];
   * cc.loaderp.loadResAll(resources).then(([atlas, json]) => {
   *   this.atlas = atlas;
   *   this.json = json;
   * })
   */
  loaderp.loadResAll = function (resources) {
    const promises = resources.map(args => cc.loaderp.loadRes.apply(cc.loaderp, args));
    return Promise.all(promises);
  };

  loaderp.loadAll = function (resources) {
    const promises = resources.map(args => cc.loaderp.load.apply(cc.loaderp, args));
    return Promise.all(promises);
  };

  /**
   * Load sprite atalas from remote url
   * @param  {String} url, url without extension
   * @return {Promise}
   */
  loaderp.loadAtlas = function (url, imageExt = '.png', plistExt = '.plist') {
    return this.loadAll([[`${url}${plistExt}`], [`${url}${imageExt}`]]).then(([plist, texture]) => {
      if (!plist || !plist.frames) return;

      // create sprite frames from plist and texture
      const spriteFrames = {}
      for (let name in plist.frames) {
        let frame = plist.frames[name];
        let rect = plistArrayToCcType(frame.frame || frame.textureRect, cc.Rect);
        let offset = plistArrayToCcType(frame.offset || frame.spriteOffset, cc.Vec2);
        let originalSize = plistArrayToCcType(frame.sourceSize || frame.spriteSourceSize, cc.size);

        const spriteFrame = new cc.SpriteFrame();
        name = name.replace(imageExt, '');
        spriteFrame.name = name;
        spriteFrame.setTexture(texture, rect, frame.rotated || frame.textureRotated, offset, originalSize);
        spriteFrames[name] = spriteFrame;
      }
      const atlas = new cc.SpriteAtlas();
      atlas._spriteFrames = spriteFrames;
      return atlas;
    });
  };

  /**
   * Convert {x,y}, {{x,y}, {width, height}} to cc types (cc.Rect, cc.size, cc.Vec2, etc.)
   * @param  {String} plistArrayStr
   * @param  {Function} ctor
   * @return {Object}
   */
  const plistArrayToCcType = function plistArrayToCcType(plistArrayStr, ctor) {
    const ary = plistArrayStr.replace(/[^0-9,]/g, '').split(',').map(x => parseInt(x, 10));
    return new ctor(...ary);
  };

  function playDragonBoneAnimationOnNode(node, atlas, asset, armatureName, animationName, play, times) {
    let display = node.getComponent(dragonBones.ArmatureDisplay);
    if (display) {
      display.destroy();
    } else {
      display = node.addComponent(dragonBones.ArmatureDisplay);
    }
    display.dragonAtlasAsset = atlas;
    display.dragonAsset = asset;
    display.armatureName = armatureName;
    if (animationName) display.animationName = animationName;
    if (play) display.playAnimation(animationName, times);
  }

  /**
   * Load dragon bones from remote
   */
  loaderp.loadDragonBone = function ({skeUrl, texJsonUrl, texUrl, armatureName, animationName, play = true, times = 1}, node) {
    return new Promise((resolve, reject) => {
      cc.loaderp.loadAll([
        [{url: skeUrl, type: 'txt'}],
        [{url: texJsonUrl, type: 'txt'}],
        [{url: texUrl, type: 'png'}]
      ]).then(([dragonBonesJson, atlasJson, texture]) => {
        const atlas = new dragonBones.DragonBonesAtlasAsset();
        atlas.atlasJson = atlasJson;
        atlas.texture = texture;

        const asset = new dragonBones.DragonBonesAsset();
        asset.dragonBonesJson = dragonBonesJson;

        if (node) {
          playDragonBoneAnimationOnNode(node, atlas, asset, armatureName, animationName, play, times);
          resolve(display);
        } else {
          resolve([atlas, asset]);
        }
      }).catch(reject);
    });
  };

  /**
   * Load dragon bones from assets/resources/skeletons
   */
  loaderp.loadDragonBoneRes = function ({skeUrl, texJsonUrl, armatureName, animationName, play = true, times = 1}, node) {
    return new Promise((resolve, reject) => {
      cc.loaderp.loadResAll([
        [skeUrl, dragonBones.DragonBonesAsset],
        [texJsonUrl, dragonBones.DragonBonesAtlasAsset],
      ]).then(([asset, atlas]) => {
        if (node) {
          playDragonBoneAnimationOnNode(node, atlas, asset, armatureName, animationName, play, times);
          resolve(display);
        } else {
          resolve([atlas, asset]);
        }
      }).catch(reject);
    });
  }

  function loadDragonBone (method, ...args) {
    return method === 'loadAll' ? loadDragonBone(...args) : loadDragonBoneRes(...args);
  }


  cc.loaderp.loadSpine = loadSpine;
  cc.loaderp.loadSpineRes = loadSpineRes;

  /**
   * Load Spine resources from remote
   *
   * @param {*} {skeUrl, texJsonUrl, texUrl, armatureName, animationName, trackIndex = 0, play = true, times = 1}
   * @param {*} node
   * @returns
   */
  function loadSpine({skeUrl, texJsonUrl, texUrl, armatureName, animationName, trackIndex = 0, play = true, times = 1}, node) {
    return new Promise((resolve, reject) => {
      cc.loaderp.loadAll([
        [{url: skeUrl, type: 'txt'}],
        [{url: texJsonUrl, type: 'txt'}],
        [{url: texUrl, type: 'png'}]
      ]).then(([spineJson, atlasJson, texture]) => {
        var asset = new sp.SkeletonData();
        asset.skeletonJson = spineJson;
        asset.atlasText = atlasJson;
        asset.textures = [texture];
        asset.textureNames = texUrl.split(/[/\\]/).slice(-1);
        if (node) {
          let ske = node.getComponent(sp.Skeleton);
          if (ske) {
            ske.destroy();
          } else {
            ske = node.addComponent(sp.Skeleton);
          }
          ske.skeletonData = asset;
          ske.setSkin(armatureName);
          if (play && animationName) {
            doPlaySpineAnimation(ske, trackIndex, animationName, times);
          }
          resolve(ske);
        } else {
          resolve([asset])
        }
      }).catch(reject);
    });
  }

  function doPlaySpineAnimation(ske, trackIndex, animationName, times) {
    if (times >= 1) {
      ske.setCompleteListener((trackEntry) => {
        times -= 1;
        let name = trackEntry.animation ? trackEntry.animation.name : '';
        if (name === animationName && times > 0) {
          ske.setAnimation(trackIndex, animationName, false);
        } else {
          ske.setCompleteListener();
        }
      });
    }
    ske.setAnimation(trackIndex, animationName, times < 0);
  }

  /**
   * Load Spine resources from assets/resources/skeletons
   *
   * @param {*} {name, animationName, trackIndex = 0, play = true, times = 1}
   * @param {*} node
   * @returns
   */
  function loadSpineRes({name, animationName, trackIndex = 0, play = true, times = 1}, node) {
    return new Promise((resolve, reject) => {
      cc.loaderp.loadRes(name, sp.SkeletonData).then(data => {
        if (node) {
          let ske = node.getComponent(sp.Skeleton);
          if (ske) {
            ske.destroy();
          } else {
            ske = node.addComponent(sp.Skeleton);
          }
          ske.skeletonData = data;
          if (play && animationName) {
            doPlaySpineAnimation(ske, trackIndex, animationName, times);
          }
          resolve(ske);
        } else {
          resolve([atlas, asset])
        }
      }).catch(reject);
    });
  }
}
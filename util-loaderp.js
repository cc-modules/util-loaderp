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
  loaderp.loadResAll = function (paramArray) {
    const promises = paramArray.map(args => cc.loaderp.loadRes.apply(cc.loaderp, args));
    return Promise.all(promises);
  };

  loaderp.loadAll = function (paramArray) {
    const promises = paramArray.map(args => cc.loaderp.load.apply(cc.loaderp, args));
    return Promise.all(promises);
  }
}
declare namespace cc {
  export module loaderp {
      /**
       * 从resource目录加载资源，cc.loader.loadRes的Promise版本
       *
       * @export
       * @template T
       * @param {string} resource
       * @returns {Promise<T>}
       */
      export function loadRes<T extends cc.Asset>(resource: string): Promise<T | string>;
      /**
       * 从resource目录加载资源，cc.loader.loadRes的Promise版本
       *
       * @export
       * @template T
       * @param {string} resource
       * @param {typeof T} type
       * @returns {Promise<T>}
       */
      export function loadRes<T extends cc.Asset>(resource: string, type: typeof T): Promise<T | string>;


      /**
       * cc.loader.load的Promise版本
       *
       * @export
       * @template T
       * @param {(string|string[]|{uuid?: string, url?: string, type?: string})} resources
       * @returns {Promise<T>}
       */
      export function load<T extends cc.Asset>(resources: string|string[]|{uuid?: string, url?: string, type?: string}): Promise<T | string>;

      /**
       * 从resource目录加载一组资源
       *
       * @export
       * @template T
       * @param {string[]} resources
       * @returns {Promise<T[]>}
       */
      export function loadResAll<T extends cc.Asset>(resources: [string, typeof cc.Asset?][]): Promise<(T | string)[]>;

      /**
       * 加载一组资源
       *
       * @export
       * @template T
       * @param {string[]} resources
       * @returns {Promise<T[]>}
       * @example
       *
       * const resources = [
       *  ['atlas', cc.SpriteAtlas],
       *  ['json']
       * ];
       * cc.loaderp.loadResAll(resources).then(([atlas, json]) => {
       *   this.atlas = atlas;
       *   this.json = json;
       * })
       *
       */
      export function loadAll<T extends cc.Asset>(resources: [string, typeof cc.Asset?][]): Promise<(T | string)[]>;

      /**
       * 从远端加载图集
       *
       * @export
       * @param {string} url
       * @param {string} [imageExt='.png']
       * @param {string} [plistExt='.plist']
       * @returns {cc.SpriteFrame}
       */
      export function loadAtlas(url: string, imageExt: string = '.png', plistExt: string = '.plist'): Promise<cc.SpriteAtlas>;

      export interface IDragonBoneLoadFromResOptions {
          skeUrl: string;
          texJsonUrl: string;
      };
      export interface IDragonBoneLoadFromRemoteOptions extends IDragonBoneLoadFromResOptions{
        texUrl: string;
      }
      interface IDragonBonePlayOptions {
        armatureName: string;
        animationName: string;
        play?: boolean = true;
        times?: number = 1;
      }
      export interface IDragonBoneLoadAndPlayFromResOptions extends IDragonBoneLoadFromResOptions, IDragonBonePlayOptions {}
      export interface IDragonBoneLoadAndPlayFromRemoteOptions extends IDragonBoneLoadFromRemoteOptions, IDragonBonePlayOptions {}
      /**
       * 加载龙骨资源并播放
       *
       * @export
       * @param {*} {skeUrl, texJsonUrl, texUrl, armatureName, animationName, play = true, times = 1}
       * @param {T} [node]
       */
      export function loadDragonBone(opts: IDragonBoneLoadAndPlayFromRemoteOptions, node: cc.Node): Promise<dragonBones.ArmatureDisplay>;
      export function loadDragonBone(opts: IDragonBoneLoadFromRemoteOptions): Promise<[dragonBones.DragonBonesAtlasAsset,  dragonBones.DragonBonesAsset]>;
      /**
       * 从assets/resources加载龙骨资源并播放
       *
       * @export
       * @param {*} {skeUrl, texJsonUrl, texUrl, armatureName, animationName, play = true, times = 1}
       * @param {T} [node]
       */
      export function loadDragonBoneRes(opts: IDragonBoneLoadAndPlayFromResOptions, node: cc.Node): Promise<dragonBones.ArmatureDisplay>;
      export function loadDragonBoneRes(opts: IDragonBoneLoadFromResOptions): Promise<[dragonBones.DragonBonesAtlasAsset,  dragonBones.DragonBonesAsset]>;
      /**
       * 加载Spine资源并播放
       *
       * @export
       * @param {*} {skeUrl, texJsonUrl, texUrl, armatureName, animationName, play = true, times = 1}
       * @param {T} [node]
       */
      export function loadSpine(opts: IDragonBoneLoadOptions, node: cc.Node): Promise<sp.Skeleton>;
      export function loadSpine(opts: IDragonBoneLoadOptions): Promise<[sp.SkeletonData]>;
      /**
       * 从assets/resources加载Spine资源并播放
       *
       * @export
       * @param {*} {skeUrl, texJsonUrl, texUrl, armatureName, animationName, play = true, times = 1}
       * @param {T} [node]
       */
      export function loadSpineRes(opts: IDragonBoneLoadOptions, node: cc.Node): Promise<sp.Skeleton>;
      export function loadSpineRes(opts: IDragonBoneLoadOptions): Promise<[sp.SkeletonData]>;
  }
}
function getBlacklistRE (platform) {
 return new RegExp(
   '/(nodejs-assets|android|ios)/'
 )
}

module.exports = {
  getBlacklistRE
}

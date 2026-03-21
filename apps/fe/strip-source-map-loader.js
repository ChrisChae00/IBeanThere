module.exports = function (source) {
  return source.replace(/\/\/# sourceMappingURL=\S+/g, '');
};

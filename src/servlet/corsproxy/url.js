import url from 'url';

/**
 *
 * @param {Object} req
 * @returns {Object}
 */
url.parseRequest = (req) => {
  let path = req.url.slice(1);
  path = /^https?:/.test(path) ? path : req.protocol + '://' + path;

  return url.parse(path);
};

export default url;

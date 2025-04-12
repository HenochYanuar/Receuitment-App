const err500 = {
  message : '500 | Internal Server Error',
  layout : 'error/error',
  title : '500 | Internal Server Error'
}

const err404 = {
 message : '404 | Page Not Found',
 layout : 'error/error',
 title: '404 | Page Not Found'
}

const err403 = {
  message : '403 | Forbidden',
  layout : 'error/error',
  title : '403 | Forbidden'
}

module.exports = {
  err500, err404, err403
}
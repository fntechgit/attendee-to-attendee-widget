export const extractBaseUrl = (url) => {
  let baseUrl = url.split('?')[0]
  if (baseUrl) baseUrl = baseUrl.split('#')[0]
  return baseUrl
}

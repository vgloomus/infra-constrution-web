export function sysLogout() {
  const baseUrl = window.location.origin
  const serviceUrl = encodeURIComponent(`${baseUrl}/login`)
  const token = window.localStorage.getItem('geipToken')
  window.location.href = `/api/portal/v4/logout?userToken=${token}&serviceUrl=${serviceUrl}`
}

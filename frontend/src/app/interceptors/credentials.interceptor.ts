import { HttpInterceptorFn } from '@angular/common/http';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfToken = getCookie('csrftoken');
  let headers = req.headers;
  if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    headers = headers.set('X-CSRFToken', csrfToken);
  }

  const modifiedReq = req.clone({
    withCredentials: true,
    headers,
  });
  return next(modifiedReq);
};

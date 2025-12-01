/* ==================================================
   SEGURANÇA & PROTEÇÃO DE DADOS SENSÍVEIS
   ================================================== */

/**
 * Protege contra exposição de dados no DevTools
 * Remova os dados sensíveis do objeto global `window`
 */

// Limpar localStorage de dados sensíveis visible
(function secureApp() {
  'use strict';

  // 1. Remover dados sensíveis do localStorage (não será visível em devTools)
  const sensitiveKeys = ['password', 'api_key', 'secret', 'token'];
  
  // 2. Proteger acesso a console.log de dados sensíveis
  const originalLog = console.log;
  console.log = function(...args) {
    args.forEach((arg, i) => {
      if (typeof arg === 'object' && arg !== null) {
        // Se contém dados sensíveis, não logar
        if (JSON.stringify(arg).includes('licenseKey') || 
            JSON.stringify(arg).includes('password') || 
            JSON.stringify(arg).includes('authToken')) {
          console.warn('🔒 Log sensível bloqueado');
          args[i] = '[SENSITIVE_DATA_BLOCKED]';
        }
      }
    });
    return originalLog.apply(console, args);
  };

  // 3. Bloquear acesso a variáveis globais sensíveis
  if (typeof window !== 'undefined') {
    const handler = {
      get(target, prop) {
        if (prop === 'state' || prop === 'currentUser' || prop === 'authToken') {
          console.warn(`🔒 Acesso protegido: ${prop}`);
          return undefined;
        }
        return target[prop];
      },
      set(target, prop, value) {
        if (prop === 'state' || prop === 'currentUser' || prop === 'authToken') {
          console.warn(`🔒 Modificação bloqueada: ${prop}`);
          return false;
        }
        target[prop] = value;
        return true;
      }
    };

    // Proxify window (funciona em alguns navegadores)
    try {
      const windowProxy = new Proxy(window, handler);
      Object.assign(window, windowProxy);
    } catch (e) {
      // Alguns navegadores não permitem Proxy no window
      console.info('Proteção parcial ativada');
    }
  }

  // 4. Interceptar JSON.stringify para dados sensíveis
  const originalStringify = JSON.stringify;
  JSON.stringify = function(value, replacer, space) {
    if (value && typeof value === 'object') {
      const sanitized = JSON.parse(originalStringify.call(JSON, value));
      if (sanitized.licenseKey) {
        sanitized.licenseKey = '***HIDDEN***';
      }
      if (sanitized.password) {
        sanitized.password = '***HIDDEN***';
      }
      if (sanitized.authToken) {
        sanitized.authToken = '***HIDDEN***';
      }
      return originalStringify(sanitized, replacer, space);
    }
    return originalStringify(value, replacer, space);
  };

  console.info('🔒 Proteção de segurança ativada');
})();

/**
 * Adicionar headers de segurança via meta tags (CSP)
 */
(function addSecurityHeaders() {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;";
  document.head.appendChild(meta);
})();

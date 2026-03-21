# Vector Crypto App - Sicherheitsaudit

## Kritische Probleme

### 1. XSS in chart.tsx (HIGH)
**Datei:** `src/components/ui/chart.tsx` (Zeile 70-86)
**Problem:** `dangerouslySetInnerHTML` ohne Escaping
**Fix:** CSS-Variablen escapen oder styled-components verwenden

```tsx
// SICHERER CODE:
const escapeCss = (str: string) => str.replace(/[<>&"']/g, '');
const safeId = escapeCss(id);
const safeColor = color ? escapeCss(color) : null;
```

### 2. XSS im Chat (MEDIUM)
**Dateien:** 
- `src/components/PublicChat.tsx`
- `src/components/AgentChat.tsx`
- `src/components/HostedRooms.tsx`

**Problem:** Benutzereingaben werden direkt gerendert
**Fix:** HTML-Escaping hinzufügen

```tsx
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
```

### 3. File Upload (MEDIUM)
**Datei:** `src/components/CryptoPanel.tsx`
**Problem:** Keine Dateigrößenbegrenzung
**Fix:** Max 5MB limitieren

```tsx
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
if (file.size > MAX_FILE_SIZE) {
  toast.error("File too large (max 5MB)");
  return;
}
```

### 4. XSS in entschlüsselten Nachrichten (MEDIUM)
**Datei:** `src/components/SecretLinks.tsx`
**Problem:** Entschlüsselte Nachrichten könnten HTML enthalten
**Fix:** Bei der Anzeige HTML escapen

## Empfohlene Sicherheitsmaßnahmen

### 1. Content Security Policy (CSP)
In `index.html` oder Server-Config:

```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline';
           style-src 'self' 'unsafe-inline';
           connect-src 'self' https://*.supabase.co;
           img-src 'self' blob: data:;">
```

### 2. Rate Limiting (Supabase)
```sql
-- Rate limiting für hosted_rooms
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE rate_limits (
  ip_hash text PRIMARY KEY,
  action text,
  count int DEFAULT 0,
  reset_at timestamptz DEFAULT now() + interval '1 minute'
);
```

### 3. Input Validierung
```typescript
// Für alle Texteingaben
const MAX_MESSAGE_LENGTH = 50000;
const MAX_ROOM_NAME_LENGTH = 64;
const ALLOWED_CHARS = /^[a-zA-Z0-9\-_\s]+$/;
```

### 4. XSS-Protection Utility
```typescript
// lib/xss.ts
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
```

## Datenbank-Sicherheit (Supabase)

### Aktuell GUT:
- ✅ RLS Policies aktiviert
- ✅ bcrypt für Passwörter
- ✅ Views für sensitive Daten
- ✅ SECURITY INVOKER für Views

### Verbesserungen:
```sql
-- Rate limiting für room creation
CREATE OR REPLACE FUNCTION check_rate_limit(p_ip_hash text, p_action text)
RETURNS boolean AS $$
DECLARE
  v_count int;
  v_reset_at timestamptz;
BEGIN
  SELECT count, reset_at INTO v_count, v_reset_at
  FROM rate_limits
  WHERE ip_hash = p_ip_hash AND action = p_action;
  
  IF v_reset_at IS NULL OR v_reset_at < now() THEN
    INSERT INTO rate_limits (ip_hash, action, count, reset_at)
    VALUES (p_ip_hash, p_action, 1, now() + interval '1 minute')
    ON CONFLICT (ip_hash) DO UPDATE
    SET count = 1, reset_at = now() + interval '1 minute';
    RETURN true;
  END IF;
  
  IF v_count >= 10 THEN
    RETURN false;
  END IF;
  
  UPDATE rate_limits SET count = count + 1
  WHERE ip_hash = p_ip_hash AND action = p_action;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Zusammenfassung

| Kategorie | Status |
|-----------|--------|
| Verschlüsselung | ✅ SICHER |
| Passwort-Hashing | ✅ SICHER |
| Datenbank-RLS | ✅ SICHER |
| XSS-Schutz | ⚠️ VERBESSERN |
| Input-Validierung | ⚠️ VERBESSERN |
| Rate Limiting | ❌ FEHLEND |
| CSP | ❌ FEHLEND |

**Priorität:**
1. XSS in chart.tsx fixen
2. Input-Sanitization für alle Chats
3. CSP implementieren
4. Rate Limiting hinzufügen
